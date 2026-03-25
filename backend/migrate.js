require('dotenv').config();
const pool = require('./db');

const migrate = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'employee' CHECK (role IN ('employee','hr')),
      department TEXT DEFAULT '',
      position TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      join_date TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in-progress','completed')),
      deadline TIMESTAMPTZ NOT NULL,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS task_assignees (
      task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      date TIMESTAMPTZ NOT NULL,
      time TEXT NOT NULL,
      end_time TEXT DEFAULT '',
      link TEXT DEFAULT '',
      agenda TEXT DEFAULT '',
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','ongoing','completed','cancelled')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS meeting_participants (
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (meeting_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'system' CHECK (type IN ('task','meeting','system','announcement')),
      read_status BOOLEAN DEFAULT FALSE,
      link TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','urgent')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Tables created');
  await pool.end();
};

migrate().catch(err => { console.error(err); process.exit(1); });
