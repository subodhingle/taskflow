const { Pool } = require('pg');

const isProd = process.env.NODE_ENV === 'production';
const isPooler = (process.env.DB_HOST || '').includes('pooler.supabase.com');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Use SSL in production unless connecting via pooler (which doesn't support it)
  ssl: isProd && !isPooler ? { rejectUnauthorized: true } : false,
  // Connection pool limits — prevent DB exhaustion
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err.message);
});

module.exports = pool;
