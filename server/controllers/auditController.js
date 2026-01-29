const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs for a record
// @route   GET /api/audit/:recordId
// @access  Analyst/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({ recordId: req.params.recordId })
        .populate('changedBy', 'username')
        .sort({ timestamp: -1 });

    res.json(logs);
});

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Analyst/Admin
const getAllAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({})
        .populate('changedBy', 'username')
        .sort({ timestamp: -1 })
        .limit(100);

    res.json({ logs });
});

module.exports = { getAuditLogs, getAllAuditLogs };
