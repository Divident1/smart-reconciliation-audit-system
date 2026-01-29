const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const Record = require('../models/Record');
const UploadJob = require('../models/UploadJob');

const processFile = async (uploadJobId, filePath, mapping) => {
    try {
        const job = await UploadJob.findById(uploadJobId);
        if (!job) {
            console.error('Job not found for processing');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        let records = [];

        if (ext === '.csv') {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => records.push(data))
                .on('end', async () => {
                    await saveRecords(records, job, filePath, mapping);
                });
        } else if (ext === '.xlsx' || ext === '.xls') {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            records = xlsx.utils.sheet_to_json(sheet);
            await saveRecords(records, job, filePath, mapping);
        }

    } catch (error) {
        console.error('Error processing file:', error);
        await UploadJob.findByIdAndUpdate(uploadJobId, {
            status: 'Failed',
            errorMessage: error.message
        });
    }
};

const saveRecords = async (records, job, filePath, mapping) => {
    try {
        const formattedRecords = records.map(record => {
            // Apply mapping if provided, otherwise fallback to defaults
            const transactionId = mapping?.transactionId ? record[mapping.transactionId] :
                (record.TransactionID || record['Transaction ID'] || record.transactionId);

            const amount = mapping?.amount ? record[mapping.amount] :
                (record.Amount || record.amount);

            const referenceNumber = mapping?.referenceNumber ? record[mapping.referenceNumber] :
                (record.ReferenceNumber || record['Reference Number'] || record.referenceNumber);

            const date = mapping?.date ? record[mapping.date] :
                (record.Date || record.date);

            return {
                transactionId: transactionId?.toString(),
                amount: parseFloat(amount),
                referenceNumber: referenceNumber?.toString(),
                date: new Date(date),
                uploadJobId: job._id
            };
        }).filter(r => r.transactionId && !isNaN(r.amount));

        // Batch insert for performance
        // batch size 1000? Mongoose insertMany handles it but for 50k might be heavy memory if not careful.
        // For 50k, insertMany is usually fine in chunks.

        // Let's do chunks of 5000
        const chunkSize = 5000;
        let successCount = 0;

        for (let i = 0; i < formattedRecords.length; i += chunkSize) {
            const chunk = formattedRecords.slice(i, i + chunkSize);
            await Record.insertMany(chunk);
            successCount += chunk.length;
        }

        // Trigger Reconciliation
        const { reconcileBatch } = require('./matcher');
        await reconcileBatch(job._id);

        await UploadJob.findByIdAndUpdate(job._id, {
            status: 'Completed',
            totalRecords: successCount
        });

        // Delete file after processing?
        // fs.unlinkSync(filePath); 

    } catch (error) {
        console.error('Error saving records:', error);
        await UploadJob.findByIdAndUpdate(job._id, {
            status: 'Failed',
            errorMessage: error.message
        });
    }
};

module.exports = { processFile };
