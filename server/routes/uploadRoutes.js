const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, analyst } = require('../middleware/authMiddleware');
const { uploadFile, getUploadJobStatus, getUploadJobs } = require('../controllers/uploadController');

// Upload requires Analyst or Admin role
router.post('/', protect, analyst, upload.single('file'), uploadFile);
router.get('/', protect, getUploadJobs);
router.get('/:id', protect, getUploadJobStatus);

module.exports = router;
