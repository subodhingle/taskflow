const jwt = require('jsonwebtoken');
const pool = require('../db');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Not authorized, no token' });

    const token = authHeader.split(' ')[1];
    if (!token)
      return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate decoded payload shape
    if (!decoded?.id)
      return res.status(401).json({ message: 'Invalid token payload' });

    const { rows } = await pool.query(
      'SELECT id,name,email,role,department,position,avatar,phone,join_date,created_at FROM users WHERE id=$1',
      [decoded.id]
    );
    if (!rows[0])
      return res.status(401).json({ message: 'Not authorized, user not found' });

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Session expired, please log in again' });
    if (err.name === 'JsonWebTokenError')
      return res.status(401).json({ message: 'Invalid token' });
    res.status(401).json({ message: 'Not authorized' });
  }
};

const hrOnly = (req, res, next) => {
  if (req.user?.role === 'hr') return next();
  res.status(403).json({ message: 'Access denied: HR only' });
};

module.exports = { protect, hrOnly };
