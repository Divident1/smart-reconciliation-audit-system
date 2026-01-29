const mongoose = require('mongoose');

const reconciliationResultSchema = mongoose.Schema({
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        required: true
    },
    status: {
        type: String,
        enum: ['Matched', 'Partially Matched', 'Duplicate', 'Not Matched', 'Unmatched'],
        required: true
    },
    systemRecordId: {
        type: String, // Or ObjectId if system records are in another collection. Assuming Record model for now.
        // For this assignment, "system records" might be previous uploads or a separate seeded collection.
        // Let's assume system records are also in 'Record' collection or another one.
        // The prompt says "reconcile it against system records".
        // I will add a field to Record Schema 'isSystemRecord' or similar later?
        // Or maybe just store the ID here.
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const ReconciliationResult = mongoose.model('ReconciliationResult', reconciliationResultSchema);
module.exports = ReconciliationResult;
