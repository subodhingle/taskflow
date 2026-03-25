const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, department, position } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role || 'employee', department, position });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
