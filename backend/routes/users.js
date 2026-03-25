const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, hrOnly } = require('../middleware/auth');

// GET /api/users - HR only
router.get('/', protect, hrOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/employees - HR only
router.get('/employees', protect, hrOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/users/me - any logged-in user updates own profile
router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'department', 'position', 'phone'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users - HR creates employee
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { name, email, password, role, department, position, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password: password || 'Password123', role, department, position, phone });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id - HR only
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id - HR only
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
