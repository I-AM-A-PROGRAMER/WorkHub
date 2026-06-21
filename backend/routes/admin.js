const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (admin)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      totalStudents,
      totalRecruiters
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (non-admin only). Cascade: remove their applications and jobs.
// @access  Private (admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Cascade: if student, delete their applications
    if (user.role === 'student') {
      await Application.deleteMany({ student: user._id });
    }

    // Cascade: if recruiter, delete their jobs and associated applications
    if (user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ postedBy: user._id });
      const jobIds = recruiterJobs.map(j => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ postedBy: user._id });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: `User '${user.name}' and associated data deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// @route   GET /api/admin/jobs
// @desc    Get all jobs (admin view)
// @access  Private (admin)
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 });

    // Attach application count to each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const appCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicationCount: appCount };
      })
    );

    res.json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin jobs', error: error.message });
  }
});

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete any job + its applications (admin)
// @access  Private (admin)
router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Delete all applications for this job
    await Application.deleteMany({ job: job._id });

    // Delete the job itself
    await Job.findByIdAndDelete(job._id);

    res.json({ message: 'Job listing and associated applications deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

module.exports = router;
