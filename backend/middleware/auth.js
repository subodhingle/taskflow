const jwt = require('jsonwebtoken');
const pool = require('../db');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query('SELECT id,name,email,role,department,position,avatar,phone,join_date,created_at FROM users WHERE id=$1', [decoded.id]);
    if (!rows[0]) return res.status(401).json({ message: 'User not found' });
    req.user = rows[0];
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const hrOnly = (req, res, next) => {
  if (req.user?.role === 'hr') return next();
  res.status(403).json({ message: 'Access denied: HR only' });
};

module.exports = { protect, hrOnly };
