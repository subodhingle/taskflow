const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, hrOnly } = require('../middleware/auth');

// GET /api/inventory
router.get('/', protect, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT i.*, u.name AS created_by_name
      FROM inventory i
      LEFT JOIN users u ON u.id = i.created_by
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/inventory
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { drone_name, model, serial_number, status, quantity, location, purchase_date, notes } = req.body;
    if (!drone_name || !model || !serial_number) 
      return res.status(400).json({ message: 'Drone name, model, and serial number are required' });

    const { rows } = await pool.query(
      `INSERT INTO inventory (drone_name, model, serial_number, status, quantity, location, purchase_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *, (SELECT name FROM users WHERE id = created_by) AS created_by_name`,
      [drone_name, model, serial_number, status || 'available', quantity || 1, location || '', purchase_date || null, notes || '', req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Serial number already exists' });
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/inventory/:id
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const { drone_name, model, serial_number, status, quantity, location, purchase_date, notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE inventory SET 
       drone_name = COALESCE($1, drone_name),
       model = COALESCE($2, model),
       serial_number = COALESCE($3, serial_number),
       status = COALESCE($4, status),
       quantity = COALESCE($5, quantity),
       location = COALESCE($6, location),
       purchase_date = COALESCE($7, purchase_date),
       notes = COALESCE($8, notes),
       updated_at = NOW()
       WHERE id = $9
       RETURNING *, (SELECT name FROM users WHERE id = created_by) AS created_by_name`,
      [drone_name, model, serial_number, status, quantity, location, purchase_date, notes, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Serial number already exists' });
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
