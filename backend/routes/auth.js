const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize, generateToken } = require('../middleware/auth');

// @route   POST /api/auth/signup
// @desc    Register a new user (student or recruiter)
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, company, university, degree, gradYear, fieldOfStudy, industry, jobTitle } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Determine final role (admin override for specific email)
    const finalRole = (email.toLowerCase() === 'supriyo3606c@gmail.com') ? 'admin' : (role || 'student');

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: finalRole,
      company: company || '',
      university: university || '',
      degree: degree || '',
      gradYear: gradYear || '',
      fieldOfStudy: fieldOfStudy || '',
      industry: industry || '',
      jobTitle: jobTitle || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      resume: user.resume,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email + password + portal role validation
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, portalRole } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Account does not exist. Please sign up first.' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Portal role validation (Admin bypasses)
    const isAdmin = user.role === 'admin' || user.email === 'supriyo3606c@gmail.com';

    if (!isAdmin && portalRole) {
      if (user.role === 'recruiter' && portalRole === 'student') {
        return res.status(403).json({ message: 'Recruiters cannot sign in through the Student portal.' });
      }
      if (user.role === 'student' && portalRole === 'recruiter') {
        return res.status(403).json({ message: 'Students cannot sign in through the Recruiter portal.' });
      }
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      resume: user.resume,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Login/Register via Google (frontend sends user info after Firebase auth)
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { email, name, portalRole } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-register Google users
      const finalRole = (email.toLowerCase() === 'supriyo3606c@gmail.com') ? 'admin' : (portalRole || 'student');
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: 'google_oauth_' + Date.now(), // placeholder password for Google users
        role: finalRole
      });
    }

    // Portal role validation (Admin bypasses)
    const isAdmin = user.role === 'admin' || user.email === 'supriyo3606c@gmail.com';

    if (!isAdmin && portalRole) {
      if (user.role === 'recruiter' && portalRole === 'student') {
        return res.status(403).json({ message: 'Recruiters cannot sign in through the Student portal.' });
      }
      if (user.role === 'student' && portalRole === 'recruiter') {
        return res.status(403).json({ message: 'Students cannot sign in through the Recruiter portal.' });
      }
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      resume: user.resume,
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error during Google auth', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    company: req.user.company,
    resume: req.user.resume,
    university: req.user.university,
    degree: req.user.degree,
    gradYear: req.user.gradYear,
    fieldOfStudy: req.user.fieldOfStudy,
    industry: req.user.industry,
    jobTitle: req.user.jobTitle
  });
});

// @route   PUT /api/auth/resume
// @desc    Update student's resume link
// @access  Private (student only)
router.put('/resume', protect, authorize('student'), async (req, res) => {
  try {
    const { resume } = req.body;
    req.user.resume = resume;
    await req.user.save();
    res.json({ message: 'Resume updated successfully', resume: req.user.resume });
  } catch (error) {
    res.status(500).json({ message: 'Error updating resume', error: error.message });
  }
});

module.exports = router;