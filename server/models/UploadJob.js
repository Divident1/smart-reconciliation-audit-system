const mongoose = require('mongoose');

const uploadJobSchema = mongoose.Schema({
    status: {
        type: String,
        enum: ['Processing', 'Completed', 'Failed'],
        default: 'Processing'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    failedRecords: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String
    }
}, {
    timestamps: true
});

const UploadJob = mongoose.model('UploadJob', uploadJobSchema);
module.exports = UploadJob;
