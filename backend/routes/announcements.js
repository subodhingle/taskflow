const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, hrOnly } = require('../middleware/auth');

// POST /api/announcements
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

    const { rows } = await pool.query(
      `INSERT INTO announcements (title,content,created_by,priority) VALUES ($1,$2,$3,$4)
       RETURNING *, (SELECT name FROM users WHERE id=created_by) AS "createdByName"`,
      [title, content, req.user.id, priority || 'normal']
    );
    const announcement = rows[0];

    // Notify all employees
    const { rows: employees } = await pool.query(`SELECT id FROM users WHERE role='employee'`);
    const io = req.app.get('io');
    for (const emp of employees) {
      const { rows: [notif] } = await pool.query(
        `INSERT INTO notifications (user_id,message,type) VALUES ($1,$2,'announcement') RETURNING *`,
        [emp.id, `📢 Announcement: "${title}"`]
      );
      io.to(emp.id).emit('notification', notif);
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error('POST /announcements error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/announcements
router.get('/', protect, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, u.name AS "createdByName"
      FROM announcements a
      LEFT JOIN users u ON u.id = a.created_by
      ORDER BY a.created_at DESC
    `);
    // Shape to match frontend expectations
    res.json(rows.map(r => ({ ...r, createdBy: { name: r.createdByName } })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/announcements/:id
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id=$1', [req.params.id]);
    res.json({ message: 'Announcement deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
