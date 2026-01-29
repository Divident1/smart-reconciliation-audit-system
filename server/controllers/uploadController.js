const asyncHandler = require('express-async-handler');
const UploadJob = require('../models/UploadJob');
const { processFile } = require('../utils/fileProcessor');

// @desc    Upload records file
// @route   POST /api/upload
// @access  Analyst/Admin
const uploadFile = asyncHandler(async (req, res) => {
    console.log('UPLOAD REQUEST:', req.file, req.user); // Debug log
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    // Idempotency: Uploading same file multiple times must not duplicate records
    const existingJob = await UploadJob.findOne({
        filename: req.file.originalname,
        uploadedBy: req.user._id,
        status: 'Completed',
        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24h
    });

    if (existingJob) {
        res.status(409); // Conflict
        throw new Error(`File '${req.file.originalname}' was already uploaded and processed successfully today.`);
    }

    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : null;

    // Create a job entry
    const job = await UploadJob.create({
        uploadedBy: req.user._id,
        filename: req.file.originalname,
        status: 'Processing'
    });

    // Trigger async processing (don't await this)
    processFile(job._id, req.file.path, mapping);

    res.status(201).json({
        message: 'File uploaded successfully. Processing started.',
        jobId: job._id
    });
});

// @desc    Get upload job status
// @route   GET /api/upload/:id
// @access  Authenticated
const getUploadJobStatus = asyncHandler(async (req, res) => {
    const job = await UploadJob.findById(req.params.id);

    if (job) {
        res.json(job);
    } else {
        res.status(404);
        throw new Error('Job not found');
    }
});

// @desc    Get all upload jobs
// @route   GET /api/upload
// @access  Authenticated
const getUploadJobs = asyncHandler(async (req, res) => {
    // Pagination? For now all.
    const jobs = await UploadJob.find({}).sort({ createdAt: -1 });
    res.json(jobs);
});

module.exports = { uploadFile, getUploadJobStatus, getUploadJobs };
