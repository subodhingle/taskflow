const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../db');
const { protect, hrOnly } = require('../middleware/auth');

const SAFE = 'id,name,email,role,department,position,avatar,phone,join_date,created_at';

// GET /api/users
router.get('/', protect, hrOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${SAFE} FROM users ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/employees
router.get('/employees', protect, hrOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${SAFE} FROM users WHERE role='employee'`);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/me
router.get('/me', protect, (req, res) => res.json(req.user));

// PUT /api/users/me
router.put('/me', protect, async (req, res) => {
  try {
    const { name, department, position, phone } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), department=COALESCE($2,department),
       position=COALESCE($3,position), phone=COALESCE($4,phone), updated_at=NOW()
       WHERE id=$5 RETURNING ${SAFE}`,
      [name, department, position, phone, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/users
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { name, email, password, role, department, position, phone } = req.body;
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows[0]) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password || crypto.randomBytes(16).toString('hex'), 12);
    const { rows } = await pool.query(
      `INSERT INTO users (name,email,password,role,department,position,phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${SAFE}`,
      [name, email.toLowerCase(), hashed, role || 'employee', department || '', position || '', phone || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/:id
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const { name, department, position, phone, role } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), department=COALESCE($2,department),
       position=COALESCE($3,position), phone=COALESCE($4,phone), role=COALESCE($5,role), updated_at=NOW()
       WHERE id=$6 RETURNING ${SAFE}`,
      [name, department, position, phone, role, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/users/:id
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
