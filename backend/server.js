const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./db');

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('io', io);

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/meetings',      require('./routes/meetings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/announcements', require('./routes/announcements'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

io.on('connection', (socket) => {
  socket.on('join', (userId) => { if (userId) socket.join(userId.toString()); });
});

// Run migrations then start
const migrate = require('fs').readFileSync(require('path').join(__dirname, 'migrate.js'), 'utf8');

const start = async () => {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
        role TEXT DEFAULT 'employee' CHECK (role IN ('employee','hr')),
        department TEXT DEFAULT '', position TEXT DEFAULT '', avatar TEXT DEFAULT '',
        phone TEXT DEFAULT '', join_date TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL, description TEXT DEFAULT '',
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in-progress','completed')),
        deadline TIMESTAMPTZ NOT NULL, tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS task_assignees (
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL, date TIMESTAMPTZ NOT NULL, time TEXT NOT NULL,
        end_time TEXT DEFAULT '', link TEXT DEFAULT '', agenda TEXT DEFAULT '',
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','ongoing','completed','cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
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
        read_status BOOLEAN DEFAULT FALSE, link TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL, content TEXT NOT NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','urgent')),
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ PostgreSQL tables ready');
  } catch (err) {
    console.error('❌ DB migration failed:', err.message);
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`)
  );
};

start();

process.on('SIGTERM', async () => { await pool.end(); server.close(() => process.exit(0)); });
process.on('SIGINT',  async () => { await pool.end(); server.close(() => process.exit(0)); });
