const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('./models/User');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Task.deleteMany(),
    Meeting.deleteMany(),
    Announcement.deleteMany(),
    Notification.deleteMany(),
  ]);

  // Create HR admin
  const hr = await User.create({
    name: 'Sarah Johnson',
    email: 'hr@company.com',
    password: 'password123',
    role: 'hr',
    department: 'Human Resources',
    position: 'HR Manager'
  });

  // Create employees
  const emp1 = await User.create({
    name: 'Alex Chen',
    email: 'alex@company.com',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    position: 'Frontend Developer'
  });

  const emp2 = await User.create({
    name: 'Maria Garcia',
    email: 'maria@company.com',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    position: 'Backend Developer'
  });

  const emp3 = await User.create({
    name: 'James Wilson',
    email: 'james@company.com',
    password: 'password123',
    role: 'employee',
    department: 'Design',
    position: 'UI/UX Designer'
  });

  // Create tasks
  const now = new Date();
  await Task.create([
    {
      title: 'Build Login Page',
      description: 'Create responsive login page with form validation',
      assignedTo: [emp1._id],
      createdBy: hr._id,
      priority: 'high',
      status: 'completed',
      deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Design Dashboard UI',
      description: 'Create wireframes and mockups for the main dashboard',
      assignedTo: [emp3._id],
      createdBy: hr._id,
      priority: 'high',
      status: 'in-progress',
      deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'API Integration',
      description: 'Integrate REST APIs with the frontend application',
      assignedTo: [emp1._id, emp2._id],
      createdBy: hr._id,
      priority: 'medium',
      status: 'in-progress',
      deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Database Schema Design',
      description: 'Design and implement MongoDB schemas for all entities',
      assignedTo: [emp2._id],
      createdBy: hr._id,
      priority: 'high',
      status: 'completed',
      deadline: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Write Unit Tests',
      description: 'Write unit tests for all API endpoints',
      assignedTo: [emp2._id],
      createdBy: hr._id,
      priority: 'medium',
      status: 'pending',
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Mobile Responsive Design',
      description: 'Ensure all pages are fully responsive on mobile devices',
      assignedTo: [emp3._id],
      createdBy: hr._id,
      priority: 'low',
      status: 'pending',
      deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Create meetings
  await Meeting.create([
    {
      title: 'Sprint Planning',
      participants: [emp1._id, emp2._id, emp3._id],
      date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      time: '10:00',
      endTime: '11:00',
      link: 'https://meet.google.com/abc-defg-hij',
      agenda: 'Plan tasks for the upcoming sprint, assign story points',
      createdBy: hr._id
    },
    {
      title: 'Design Review',
      participants: [emp3._id],
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      time: '14:00',
      endTime: '15:00',
      link: 'https://zoom.us/j/123456789',
      agenda: 'Review dashboard mockups and gather feedback',
      createdBy: hr._id
    },
    {
      title: 'Team Standup',
      participants: [emp1._id, emp2._id, emp3._id],
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      time: '09:00',
      endTime: '09:30',
      link: 'https://meet.google.com/xyz-uvwx-yz',
      agenda: 'Daily standup: what did you do, what will you do, blockers',
      createdBy: hr._id
    }
  ]);

  // Create announcements
  await Announcement.create([
    {
      title: 'Q2 Performance Reviews',
      content: 'Q2 performance reviews will begin next week. Please prepare your self-assessment forms.',
      createdBy: hr._id,
      priority: 'urgent'
    },
    {
      title: 'New Office Policy',
      content: 'Starting next month, we will have flexible working hours. Core hours are 10am-3pm.',
      createdBy: hr._id,
      priority: 'normal'
    }
  ]);

  console.log('✅ Seed data created successfully!');
  console.log('HR Login: hr@company.com / password123');
  console.log('Employee Login: alex@company.com / password123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
