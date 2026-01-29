const express = require('express');
const router = express.Router();
const { protect, analyst } = require('../middleware/authMiddleware');
const { getReconciliationResults, getReconciliationStats, updateRecord } = require('../controllers/reconciliationController');

router.get('/:jobId', protect, analyst, getReconciliationResults);
router.get('/:jobId/stats', protect, analyst, getReconciliationStats);
router.put('/record/:id', protect, analyst, updateRecord);

module.exports = router;
