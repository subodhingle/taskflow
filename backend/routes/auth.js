const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const logger = require('../logger');

const getIP = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0].trim() ||
  req.socket?.remoteAddress || 'unknown';

// ── Token generation ──────────────────────────────────────────────────────────
const generateToken = (id) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error('JWT_SECRET must be at least 32 characters');
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── Rate limiters ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn({
      event: 'rate_limit_hit',
      type: 'login',
      ip: getIP(req),
      email: req.body?.email,
    });
    res.status(429).json(options.message);
  },
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many accounts created from this IP. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn({
      event: 'rate_limit_hit',
      type: 'signup',
      ip: getIP(req),
    });
    res.status(429).json(options.message);
  },
});

// ── Validation ────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_ROLES = ['employee', 'hr'];

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup', signupLimiter, async (req, res) => {
  const ip = getIP(req);
  try {
    const { name, email, password, role, department, position } = req.body;

    if (!name?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (!EMAIL_REGEX.test(email))
      return res.status(400).json({ message: 'Invalid email address' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      return res.status(400).json({ message: 'Password must contain uppercase, lowercase and a number' });
    if (name.trim().length > 100)
      return res.status(400).json({ message: 'Name too long' });

    const safeRole = SAFE_ROLES.includes(role) ? role : 'employee';

    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase().trim()]);
    if (exists.rows[0]) {
      logger.warn({ event: 'signup_duplicate_email', email: email.toLowerCase(), ip });
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (name,email,password,role,department,position)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id,name,email,role,department,position,avatar,phone,join_date,created_at`,
      [name.trim(), email.toLowerCase().trim(), hashed, safeRole, department?.trim() || '', position?.trim() || '']
    );

    logger.auth({ event: 'signup_success', userId: rows[0].id, email: rows[0].email, role: safeRole, ip });
    res.status(201).json({ token: generateToken(rows[0].id), user: rows[0] });
  } catch (err) {
    logger.error({ event: 'signup_error', ip, error: err.message });
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  const ip = getIP(req);
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password)
      return res.status(400).json({ message: 'Email and password are required' });
    if (!EMAIL_REGEX.test(email))
      return res.status(400).json({ message: 'Invalid email address' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase().trim()]);
    const user = rows[0];

    // Constant-time compare to prevent user enumeration via timing
    const dummyHash = '$2a$12$dummyhashfortimingnormalization000000000000000000000000';
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !passwordMatch) {
      logger.auth({ event: 'login_failed', email: email.toLowerCase(), ip });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    logger.auth({ event: 'login_success', userId: user.id, email: user.email, role: user.role, ip });

    const { password: _, ...safeUser } = user;
    res.json({ token: generateToken(user.id), user: safeUser });
  } catch (err) {
    logger.error({ event: 'login_error', ip, error: err.message });
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

module.exports = router;
