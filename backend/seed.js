const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const pool = require('./db');

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  await pool.query(`
    TRUNCATE announcements, notifications, meeting_participants, meetings,
             task_assignees, tasks, users RESTART IDENTITY CASCADE
  `);

  const hash = await bcrypt.hash('password123', 12);

  // Create users
  const { rows: [hr] } = await pool.query(
    `INSERT INTO users (name,email,password,role,department,position) VALUES ($1,$2,$3,'hr',$4,$5) RETURNING id`,
    ['Sarah Johnson', 'hr@company.com', hash, 'Human Resources', 'HR Manager']
  );
  const { rows: [emp1] } = await pool.query(
    `INSERT INTO users (name,email,password,role,department,position) VALUES ($1,$2,$3,'employee',$4,$5) RETURNING id`,
    ['Alex Chen', 'alex@company.com', hash, 'Engineering', 'Frontend Developer']
  );
  const { rows: [emp2] } = await pool.query(
    `INSERT INTO users (name,email,password,role,department,position) VALUES ($1,$2,$3,'employee',$4,$5) RETURNING id`,
    ['Maria Garcia', 'maria@company.com', hash, 'Engineering', 'Backend Developer']
  );
  const { rows: [emp3] } = await pool.query(
    `INSERT INTO users (name,email,password,role,department,position) VALUES ($1,$2,$3,'employee',$4,$5) RETURNING id`,
    ['James Wilson', 'james@company.com', hash, 'Design', 'UI/UX Designer']
  );

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  // Create tasks
  const tasks = [
    ['Build Login Page', 'Create responsive login page with form validation', 'high', 'completed', new Date(now - 2 * day)],
    ['Design Dashboard UI', 'Create wireframes and mockups for the main dashboard', 'high', 'in-progress', new Date(now + 3 * day)],
    ['API Integration', 'Integrate REST APIs with the frontend application', 'medium', 'in-progress', new Date(now + 5 * day)],
    ['Database Schema Design', 'Design and implement schemas for all entities', 'high', 'completed', new Date(now - 5 * day)],
    ['Write Unit Tests', 'Write unit tests for all API endpoints', 'medium', 'pending', new Date(now + 7 * day)],
    ['Mobile Responsive Design', 'Ensure all pages are fully responsive on mobile', 'low', 'pending', new Date(now - 1 * day)],
  ];

  const taskIds = [];
  for (const [title, description, priority, status, deadline] of tasks) {
    const { rows: [t] } = await pool.query(
      `INSERT INTO tasks (title,description,created_by,priority,status,deadline) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [title, description, hr.id, priority, status, deadline]
    );
    taskIds.push(t.id);
  }

  // Assign tasks
  const assignees = [
    [taskIds[0], [emp1.id]],
    [taskIds[1], [emp3.id]],
    [taskIds[2], [emp1.id, emp2.id]],
    [taskIds[3], [emp2.id]],
    [taskIds[4], [emp2.id]],
    [taskIds[5], [emp3.id]],
  ];
  for (const [taskId, users] of assignees)
    for (const userId of users)
      await pool.query('INSERT INTO task_assignees (task_id,user_id) VALUES ($1,$2)', [taskId, userId]);

  // Create meetings
  const meetings = [
    ['Sprint Planning', new Date(now + 1 * day), '10:00', '11:00', 'https://meet.google.com/abc-defg-hij', 'Plan tasks for the upcoming sprint', [emp1.id, emp2.id, emp3.id]],
    ['Design Review', new Date(now + 2 * day), '14:00', '15:00', 'https://zoom.us/j/123456789', 'Review dashboard mockups', [emp3.id]],
    ['Team Standup', new Date(now + 3 * day), '09:00', '09:30', 'https://meet.google.com/xyz-uvwx-yz', 'Daily standup', [emp1.id, emp2.id, emp3.id]],
  ];

  for (const [title, date, time, endTime, link, agenda, participants] of meetings) {
    const { rows: [m] } = await pool.query(
      `INSERT INTO meetings (title,date,time,end_time,link,agenda,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [title, date, time, endTime, link, agenda, hr.id]
    );
    for (const userId of participants)
      await pool.query('INSERT INTO meeting_participants (meeting_id,user_id) VALUES ($1,$2)', [m.id, userId]);
  }

  // Create announcements
  await pool.query(
    `INSERT INTO announcements (title,content,created_by,priority) VALUES ($1,$2,$3,'urgent')`,
    ['Q2 Performance Reviews', 'Q2 performance reviews will begin next week. Please prepare your self-assessment forms.', hr.id]
  );
  await pool.query(
    `INSERT INTO announcements (title,content,created_by,priority) VALUES ($1,$2,$3,'normal')`,
    ['New Office Policy', 'Starting next month, we will have flexible working hours. Core hours are 10am-3pm.', hr.id]
  );

  console.log('✅ Seed data created!');
  console.log('HR Login:       hr@company.com / password123');
  console.log('Employee Login: alex@company.com / password123');
  await pool.end();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
