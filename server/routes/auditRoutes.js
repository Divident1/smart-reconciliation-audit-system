const express = require('express');
const router = express.Router();
const { protect, analyst } = require('../middleware/authMiddleware');
const { getAuditLogs, getAllAuditLogs } = require('../controllers/auditController');

router.get('/', protect, analyst, getAllAuditLogs);
router.get('/:recordId', protect, analyst, getAuditLogs);

module.exports = router;
