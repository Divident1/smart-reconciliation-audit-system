const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        required: true
    },
    field: {
        type: String,
        required: true
    },
    oldValue: {
        type: mongoose.Schema.Types.Mixed
    },
    newValue: {
        type: mongoose.Schema.Types.Mixed
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // required: true // Can be nullable if system change
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
