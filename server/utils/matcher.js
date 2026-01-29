const Record = require('../models/Record');
const ReconciliationResult = require('../models/ReconciliationResult');
const UploadJob = require('../models/UploadJob');

const rules = require('../config/matchingRules');

const matchSingleRecord = async (record, uploadJobId) => {
    let status = 'Unmatched';
    let systemRecordId = null;
    let notes = '';

    // Check if Exact Match ID + Amount is enabled
    if (rules.exactMatch.enabled) {
        const query = {
            uploadJobId: { $ne: uploadJobId }
        };
        rules.exactMatch.fields.forEach(field => {
            query[field] = record[field];
        });

        const exactMatchResult = await Record.findOne(query);

        if (exactMatchResult) {
            status = 'Matched';
            systemRecordId = exactMatchResult._id;
            return { status, systemRecordId, notes };
        }
    }

    // Check for Duplicate (ID exists but maybe amount differs)
    if (rules.duplicateCheck.enabled) {
        const matchById = await Record.findOne({
            transactionId: record.transactionId,
            uploadJobId: { $ne: uploadJobId }
        });

        if (matchById) {
            status = 'Duplicate';
            notes = 'Transaction ID exists with different data';
            return { status, systemRecordId, notes };
        }
    }

    // Partial Match Check
    if (rules.partialMatch.enabled) {
        const query = { uploadJobId: { $ne: uploadJobId } };
        // Assuming partial match is by Reference Number
        query.referenceNumber = record.referenceNumber;

        const refMatch = await Record.findOne(query);

        if (refMatch) {
            const variance = Math.abs((refMatch.amount - record.amount) / refMatch.amount);
            if (variance <= rules.partialMatch.variance) {
                status = 'Partially Matched';
                systemRecordId = refMatch._id;
                notes = `Amount variance: ${(variance * 100).toFixed(2)}%`;
            }
        }
    }

    return { status, systemRecordId, notes };
};

const reconcileBatch = async (uploadJobId) => {
    try {
        const job = await UploadJob.findById(uploadJobId);
        if (!job) return;

        const uploadedRecords = await Record.find({ uploadJobId });

        const transactionIdCounts = {};
        uploadedRecords.forEach(r => {
            transactionIdCounts[r.transactionId] = (transactionIdCounts[r.transactionId] || 0) + 1;
        });

        const results = [];

        for (const record of uploadedRecords) {
            let matchData = await matchSingleRecord(record, uploadJobId);

            // Override with internal duplicate check
            if (transactionIdCounts[record.transactionId] > 1) {
                matchData.status = 'Duplicate';
                matchData.notes = 'Duplicate transaction ID in uploaded file';
            }

            results.push({
                recordId: record._id,
                ...matchData
            });
        }

        await ReconciliationResult.insertMany(results);

    } catch (error) {
        console.error('Reconciliation error:', error);
    }
};

module.exports = { reconcileBatch, matchSingleRecord };
