const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/applications
// @desc    Student applies for a job
// @access  Private (student)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { jobId, resumeLink, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check for duplicate application
    const existing = await Application.findOne({ job: jobId, student: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this internship.' });
    }

    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      resumeLink,
      coverLetter: coverLetter || ''
    });

    // Also save resume link to student profile if not already set
    if (!req.user.resume && resumeLink) {
      req.user.resume = resumeLink;
      await req.user.save();
    }

    res.status(201).json(application);
  } catch (error) {
    // Handle unique index violation (duplicate application)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this internship.' });
    }
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// @route   GET /api/applications/mine
// @desc    Get all applications for the logged-in student
// @access  Private (student)
router.get('/mine', protect, authorize('student'), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job', 'title companyName location duration stipend description logoColor logoChar')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job (recruiter who owns the job, or admin)
// @access  Private (recruiter, admin)
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Recruiter can only see applications for their own jobs
    if (req.user.role === 'recruiter' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email resume')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (recruiter)
// @access  Private (recruiter)
router.put('/:id/status', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the recruiter owns this job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    const updated = await application.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

module.exports = router;
