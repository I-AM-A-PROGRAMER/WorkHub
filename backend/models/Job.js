const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  stipend: {
    type: Number,
    required: [true, 'Stipend is required'],
    min: 0
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logoColor: {
    type: String,
    default: '#635BFF'
  },
  logoChar: {
    type: String,
    default: 'W'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
