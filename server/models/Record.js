const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    referenceNumber: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    uploadJobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadJob',
        required: true
    }
}, {
    timestamps: true
});

const Record = mongoose.model('Record', recordSchema);
module.exports = Record;
