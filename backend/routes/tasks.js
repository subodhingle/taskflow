const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, hrOnly } = require('../middleware/auth');

const populateTask = async (taskId) => {
  const { rows } = await pool.query(`
    SELECT t.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id',u.id,'name',u.name,'email',u.email)) FILTER (WHERE u.id IS NOT NULL), '[]') AS "assignedTo",
      jsonb_build_object('id',cb.id,'name',cb.name,'email',cb.email) AS "createdBy"
    FROM tasks t
    LEFT JOIN task_assignees ta ON ta.task_id = t.id
    LEFT JOIN users u ON u.id = ta.user_id
    LEFT JOIN users cb ON cb.id = t.created_by
    WHERE t.id = $1
    GROUP BY t.id, cb.id, cb.name, cb.email
  `, [taskId]);
  return rows[0];
};

// POST /api/tasks
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, tags } = req.body;
    if (!title || !deadline) return res.status(400).json({ message: 'Title and deadline are required' });

    const { rows } = await pool.query(
      `INSERT INTO tasks (title,description,created_by,priority,deadline,tags)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [title, description || '', req.user.id, priority || 'medium', deadline, tags || []]
    );
    const taskId = rows[0].id;

    if (assignedTo?.length) {
      for (const userId of assignedTo) {
        await pool.query('INSERT INTO task_assignees (task_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [taskId, userId]);
        const { rows: [notif] } = await pool.query(
          `INSERT INTO notifications (user_id,message,type) VALUES ($1,$2,'task') RETURNING *`,
          [userId, `New task assigned to you: "${title}"`]
        );
        req.app.get('io').to(userId).emit('notification', notif);
      }
    }

    res.status(201).json(await populateTask(taskId));
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const isHR = req.user.role === 'hr';
    const { rows } = await pool.query(`
      SELECT t.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id',u.id,'name',u.name,'email',u.email)) FILTER (WHERE u.id IS NOT NULL), '[]') AS "assignedTo",
        jsonb_build_object('id',cb.id,'name',cb.name,'email',cb.email) AS "createdBy"
      FROM tasks t
      LEFT JOIN task_assignees ta ON ta.task_id = t.id
      LEFT JOIN users u ON u.id = ta.user_id
      LEFT JOIN users cb ON cb.id = t.created_by
      ${isHR ? '' : 'WHERE ta.user_id = $1'}
      GROUP BY t.id, cb.id, cb.name, cb.email
      ORDER BY t.created_at DESC
    `, isHR ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'employee') {
      await pool.query('UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2', [req.body.status, id]);
    } else {
      const { title, description, assignedTo, priority, status, deadline, tags } = req.body;
      await pool.query(
        `UPDATE tasks SET title=COALESCE($1,title), description=COALESCE($2,description),
         priority=COALESCE($3,priority), status=COALESCE($4,status),
         deadline=COALESCE($5,deadline), tags=COALESCE($6,tags), updated_at=NOW() WHERE id=$7`,
        [title, description, priority, status, deadline, tags, id]
      );
      if (assignedTo) {
        await pool.query('DELETE FROM task_assignees WHERE task_id=$1', [id]);
        for (const userId of assignedTo)
          await pool.query('INSERT INTO task_assignees (task_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, userId]);
      }
    }
    res.json(await populateTask(id));
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
