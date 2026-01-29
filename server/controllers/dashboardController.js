const asyncHandler = require('express-async-handler');
const UploadJob = require('../models/UploadJob');
const ReconciliationResult = require('../models/ReconciliationResult');

// @desc    Get dashboard summary stats
// @route   GET /api/dashboard/stats
// @access  Authenticated
const getDashboardStats = asyncHandler(async (req, res) => {
    const { startDate, endDate, status, userId } = req.query;

    // Filter for UploadJobs
    const jobFilter = {};
    if (userId) jobFilter.uploadedBy = userId;
    if (startDate || endDate) {
        jobFilter.createdAt = {};
        if (startDate) jobFilter.createdAt.$gte = new Date(startDate);
        if (endDate) jobFilter.createdAt.$lte = new Date(endDate);
    }

    // 1. Total Records (Filtered)
    const filteredJobs = await UploadJob.find(jobFilter).select('_id totalRecords');
    const jobIds = filteredJobs.map(j => j._id);
    const totalRecords = filteredJobs.reduce((acc, job) => acc + (job.totalRecords || 0), 0);

    // 2. Reconciliation Stats (Filtered)
    const resultFilter = { recordId: { $in: await getRecordIdsForJobs(jobIds) } };
    if (status) resultFilter.status = status;

    const reconciliationStats = await ReconciliationResult.aggregate([
        {
            $lookup: {
                from: 'records',
                localField: 'recordId',
                foreignField: '_id',
                as: 'record'
            }
        },
        { $unwind: '$record' },
        {
            $match: {
                'record.uploadJobId': { $in: jobIds },
                ...(status ? { status } : {})
            }
        },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formattedStats = {
        totalRecords,
        matched: 0,
        partiallyMatched: 0,
        duplicate: 0,
        unmatched: 0,
        accuracy: 0
    };

    let totalProcessed = 0;
    reconciliationStats.forEach(s => {
        if (s._id === 'Matched') formattedStats.matched = s.count;
        if (s._id === 'Partially Matched') formattedStats.partiallyMatched = s.count;
        if (s._id === 'Duplicate') formattedStats.duplicate = s.count;
        if (s._id === 'Unmatched' || s._id === 'Not Matched') formattedStats.unmatched += s.count;
        totalProcessed += s.count;
    });

    formattedStats.accuracy = totalProcessed > 0 ? (formattedStats.matched / totalProcessed) * 100 : 0;
    res.json(formattedStats);
});

async function getRecordIdsForJobs(jobIds) {
    // Helper to avoid massive $in if needed, but for 50k should be ok.
    // Actually simpler to just use $lookup in aggregation as above.
    return [];
}

module.exports = { getDashboardStats };
