const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Check if users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database already has ${userCount} users. Skipping seed.`);
      console.log('To re-seed, drop the database first.');
      process.exit(0);
    }

    console.log('Seeding users...');

    // Create default users
    const admin = await User.create({
      name: 'Supriyo Admin',
      email: 'supriyo3606c@gmail.com',
      password: 'WorkHub@123',
      role: 'admin'
    });

    const admin2 = await User.create({
      name: 'Super Admin',
      email: 'admin@workhub.com',
      password: 'WorkHub@123',
      role: 'admin'
    });

    const student = await User.create({
      name: 'Alex Smith',
      email: 'alex@university.edu',
      password: 'WorkHub@123',
      role: 'student',
      resume: 'https://drive.google.com/file/d/alex-resume/view',
      university: 'University of California, Berkeley',
      degree: "Bachelor's",
      gradYear: '2026',
      fieldOfStudy: 'Computer Science'
    });

    const recruiter = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@stripe.com',
      password: 'WorkHub@123',
      role: 'recruiter',
      company: 'Stripe',
      industry: 'Technology',
      jobTitle: 'Talent Acquisition Manager'
    });

    console.log('Users seeded ✓');
    console.log('Seeding jobs...');

    // Create default job listings
    await Job.create({
      title: 'Software Engineering Intern',
      companyName: 'Stripe',
      location: 'San Francisco, CA',
      duration: '3 Months',
      stipend: 15000,
      description: 'Join Stripe\'s payments engine team to build developer-friendly APIs. You will work on API integrations, dashboard enhancements, and scale infrastructure. Requirements: Strong foundations in data structures, algorithms, and web technologies.',
      postedBy: recruiter._id,
      logoColor: '#635BFF',
      logoChar: 'S'
    });

    await Job.create({
      title: 'Product Design Intern',
      companyName: 'Notion',
      location: 'Remote',
      duration: '6 Months',
      stipend: 12000,
      description: 'Work on Notion\'s core editor team. Create intuitive UX patterns, design new interactive blocks, and work closely with product managers and engineers. Requirements: Portfolio demonstrating UI/UX layout design, prototyping skills, and product thinking.',
      postedBy: recruiter._id,
      logoColor: '#000000',
      logoChar: 'N'
    });

    console.log('Jobs seeded ✓');
    console.log('\n--- Seed Complete ---');
    console.log('Default credentials for all seeded users:');
    console.log('  Password: WorkHub@123');
    console.log('  Admin:    supriyo3606c@gmail.com');
    console.log('  Admin 2:  admin@workhub.com');
    console.log('  Student:  alex@university.edu');
    console.log('  Recruiter: sarah@stripe.com');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
