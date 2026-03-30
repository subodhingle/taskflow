// Structured logger — outputs JSON in production, readable in dev
const isProd = process.env.NODE_ENV === 'production';

const level = (lvl, data) => {
  const entry = {
    ts: new Date().toISOString(),
    level: lvl,
    ...data,
  };
  if (lvl === 'error') {
    console.error(isProd ? JSON.stringify(entry) : `[${entry.ts}] ERROR ${JSON.stringify(data)}`);
  } else {
    console.log(isProd ? JSON.stringify(entry) : `[${entry.ts}] ${lvl.toUpperCase()} ${JSON.stringify(data)}`);
  }
};

const logger = {
  info:  (data) => level('info', data),
  warn:  (data) => level('warn', data),
  error: (data) => level('error', data),
  auth:  (data) => level('auth', data),   // auth-specific events
  http:  (data) => level('http', data),   // request logs
};

module.exports = logger;
