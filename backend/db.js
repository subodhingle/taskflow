const { Pool } = require('pg');

const isPooler = (process.env.DB_HOST || '').includes('pooler.supabase.com');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

module.exports = pool;
