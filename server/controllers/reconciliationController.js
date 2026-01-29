const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');
const Record = require('../models/Record');
const ReconciliationResult = require('../models/ReconciliationResult');

const { matchSingleRecord } = require('../utils/matcher');

// @desc    Update a record manually (Correction)
// @route   PUT /api/reconciliation/record/:id
// @access  Analyst/Admin
const updateRecord = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, referenceNumber, notes, status: manualStatus } = req.body;

    const record = await Record.findById(id);

    if (!record) {
        res.status(404);
        throw new Error('Record not found');
    }

    const oldAmount = record.amount;
    const oldRef = record.referenceNumber;

    // Update Record Data
    if (amount !== undefined) record.amount = Number(amount);
    if (referenceNumber) record.referenceNumber = referenceNumber;

    await record.save();

    // Create Audit Logs
    const changes = [];
    if (amount !== undefined && oldAmount !== Number(amount)) {
        changes.push({ field: 'amount', oldValue: oldAmount, newValue: Number(amount) });
    }
    if (referenceNumber && oldRef !== referenceNumber) {
        changes.push({ field: 'referenceNumber', oldValue: oldRef, newValue: referenceNumber });
    }

    if (changes.length > 0) {
        const auditLogs = changes.map(change => ({
            recordId: record._id,
            field: change.field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            changedBy: req.user._id
        }));
        await AuditLog.insertMany(auditLogs);
    }

    // Refresh Reconciliation Result
    const matchData = await matchSingleRecord(record, record.uploadJobId);

    // If user explicitly passed a manualStatus (like forcing "Matched"), use it
    if (manualStatus) {
        matchData.status = manualStatus;
    }
    if (notes) {
        matchData.notes = notes;
    }

    const updatedResult = await ReconciliationResult.findOneAndUpdate(
        { recordId: id },
        {
            status: matchData.status,
            systemRecordId: matchData.systemRecordId,
            notes: matchData.notes
        },
        { new: true }
    ).populate('recordId');

    res.json({ message: 'Record updated and re-matched', result: updatedResult });
});



// @route   GET /api/reconciliation/:jobId
// @access  Analyst/Admin
const getReconciliationResults = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // Pagination
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 20;

    const query = {};
    // We need to filter by records that belong to this job.
    // But ReconciliationResult has recordId which is a ref to Record.
    // We can populate recordId and filter? Or find records first.

    // Better: Find records for this job, then find results for those records.
    const records = await Record.find({ uploadJobId: jobId }).select('_id');
    const recordIds = records.map(r => r._id);

    const count = await ReconciliationResult.countDocuments({ recordId: { $in: recordIds } });

    const results = await ReconciliationResult.find({ recordId: { $in: recordIds } })
        .populate('recordId')
        .populate('systemRecordId') // If we want to show the matched system record
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ results, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get reconciliation stats for a job
// @route   GET /api/reconciliation/:jobId/stats
// @access  Analyst/Admin
const getReconciliationStats = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const records = await Record.find({ uploadJobId: jobId }).select('_id');
    const recordIds = records.map(r => r._id);

    const stats = await ReconciliationResult.aggregate([
        { $match: { recordId: { $in: recordIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Format stats
    const formattedStats = {
        Matched: 0,
        'Partially Matched': 0,
        Duplicate: 0,
        'Not Matched': 0, // Unmatched
        Total: recordIds.length
    };

    let reconciledCount = 0;
    stats.forEach(s => {
        formattedStats[s._id] = s.count;
        if (s._id === 'Matched') reconciledCount += s.count;
    });

    // Accuracy? (Matched / Total) * 100
    formattedStats.accuracy = recordIds.length > 0 ? (reconciledCount / recordIds.length) * 100 : 0;

    res.json(formattedStats);
});

module.exports = { getReconciliationResults, getReconciliationStats, updateRecord };
