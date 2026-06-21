const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all jobs (public). Supports ?search= query for filtering.
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { title: regex },
          { companyName: regex },
          { description: regex },
          { location: regex }
        ]
      };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// @route   GET /api/jobs/recruiter/mine
// @desc    Get jobs posted by the logged-in recruiter
// @access  Private (recruiter)
router.get('/recruiter/mine', protect, authorize('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recruiter jobs', error: error.message });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get a single job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create a new internship listing
// @access  Private (recruiter)
router.post('/', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { title, companyName, location, duration, stipend, description, logoColor, logoChar } = req.body;

    const colors = ['#635BFF', '#F24E1E', '#000000', '#10B981', '#3B82F6', '#8B5CF6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const job = await Job.create({
      title,
      companyName,
      location,
      duration,
      stipend: parseInt(stipend, 10) || 0,
      description,
      postedBy: req.user._id,
      logoColor: logoColor || randomColor,
      logoChar: logoChar || (companyName ? companyName.charAt(0).toUpperCase() : 'W')
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Edit an internship listing (only by the recruiter who posted it)
// @access  Private (recruiter)
router.put('/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only the recruiter who posted the job can edit it
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this listing' });
    }

    const { title, companyName, location, duration, stipend, description } = req.body;

    job.title = title || job.title;
    job.companyName = companyName || job.companyName;
    job.location = location || job.location;
    job.duration = duration || job.duration;
    job.stipend = stipend !== undefined ? parseInt(stipend, 10) : job.stipend;
    job.description = description || job.description;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete an internship listing + its applications (owner or admin)
// @access  Private (recruiter who owns it, or admin)
router.delete('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Recruiter can only delete their own jobs; admin can delete any
    if (req.user.role === 'recruiter' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete all applications for this job
    await Application.deleteMany({ job: job._id });

    // Delete the job
    await Job.findByIdAndDelete(job._id);

    res.json({ message: 'Job listing and associated applications deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

module.exports = router;
