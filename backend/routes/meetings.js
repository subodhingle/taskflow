const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, hrOnly } = require('../middleware/auth');

const populateMeeting = async (meetingId) => {
  const { rows } = await pool.query(`
    SELECT m.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id',u.id,'name',u.name,'email',u.email)) FILTER (WHERE u.id IS NOT NULL), '[]') AS participants,
      jsonb_build_object('id',cb.id,'name',cb.name,'email',cb.email) AS "createdBy"
    FROM meetings m
    LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id
    LEFT JOIN users u ON u.id = mp.user_id
    LEFT JOIN users cb ON cb.id = m.created_by
    WHERE m.id = $1
    GROUP BY m.id, cb.id, cb.name, cb.email
  `, [meetingId]);
  return rows[0];
};

// POST /api/meetings
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { title, participants, date, time, endTime, link, agenda } = req.body;
    if (!title || !date || !time) return res.status(400).json({ message: 'Title, date and time are required' });
    if (!participants?.length) return res.status(400).json({ message: 'Select at least one participant' });

    // Conflict check
    const conflicts = await pool.query(`
      SELECT m.id FROM meetings m
      JOIN meeting_participants mp ON mp.meeting_id = m.id
      WHERE mp.user_id = ANY($1::uuid[]) AND DATE(m.date) = DATE($2) AND m.time = $3 AND m.status != 'cancelled'
    `, [participants, date, time]);
    if (conflicts.rows.length > 0)
      return res.status(409).json({ message: `Time slot unavailable at ${time}` });

    const { rows } = await pool.query(
      `INSERT INTO meetings (title,date,time,end_time,link,agenda,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [title, date, time, endTime || '', link || '', agenda || '', req.user.id]
    );
    const meetingId = rows[0].id;

    for (const userId of participants) {
      await pool.query('INSERT INTO meeting_participants (meeting_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [meetingId, userId]);
      const { rows: [notif] } = await pool.query(
        `INSERT INTO notifications (user_id,message,type) VALUES ($1,$2,'meeting') RETURNING *`,
        [userId, `Meeting scheduled: "${title}" on ${new Date(date).toDateString()} at ${time}`]
      );
      req.app.get('io').to(userId).emit('notification', notif);
    }

    res.status(201).json(await populateMeeting(meetingId));
  } catch (err) {
    console.error('POST /meetings error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/meetings
router.get('/', protect, async (req, res) => {
  try {
    const isHR = req.user.role === 'hr';
    const { rows } = await pool.query(`
      SELECT m.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id',u.id,'name',u.name,'email',u.email)) FILTER (WHERE u.id IS NOT NULL), '[]') AS participants,
        jsonb_build_object('id',cb.id,'name',cb.name,'email',cb.email) AS "createdBy"
      FROM meetings m
      LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id
      LEFT JOIN users u ON u.id = mp.user_id
      LEFT JOIN users cb ON cb.id = m.created_by
      ${isHR ? '' : 'WHERE mp.user_id = $1'}
      GROUP BY m.id, cb.id, cb.name, cb.email
      ORDER BY m.date ASC
    `, isHR ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/meetings/:id
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const { title, date, time, endTime, link, agenda, status } = req.body;
    await pool.query(
      `UPDATE meetings SET title=COALESCE($1,title), date=COALESCE($2,date), time=COALESCE($3,time),
       end_time=COALESCE($4,end_time), link=COALESCE($5,link), agenda=COALESCE($6,agenda),
       status=COALESCE($7,status), updated_at=NOW() WHERE id=$8`,
      [title, date, time, endTime, link, agenda, status, req.params.id]
    );
    res.json(await populateMeeting(req.params.id));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/meetings/:id
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM meetings WHERE id=$1', [req.params.id]);
    res.json({ message: 'Meeting deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
