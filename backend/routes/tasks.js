const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { protect, hrOnly } = require('../middleware/auth');

// POST /api/tasks
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, tags } = req.body;

    if (!title || !deadline) return res.status(400).json({ message: 'Title and deadline are required' });

    const task = await Task.create({
      title, description, assignedTo: assignedTo || [], priority, deadline, tags: tags || [],
      createdBy: req.user._id,
    });

    const io = req.app.get('io');
    for (const userId of (assignedTo || [])) {
      const notif = await Notification.create({
        userId,
        message: `New task assigned to you: "${title}"`,
        type: 'task',
      });
      io.to(userId.toString()).emit('notification', notif);
    }

    // Re-fetch with populate (avoid chaining populate on saved doc)
    const populated = await Task.findById(task._id).populate('assignedTo createdBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'hr' ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(filter)
      .populate('assignedTo createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid task ID' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'employee') {
      // Employees can only update status
      if (req.body.status) task.status = req.body.status;
    } else {
      const { title, description, assignedTo, priority, status, deadline, tags } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;
      if (deadline !== undefined) task.deadline = deadline;
      if (tags !== undefined) task.tags = tags;
    }

    await task.save();
    const populated = await Task.findById(task._id).populate('assignedTo createdBy', 'name email');
    res.json(populated);
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid task ID' });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
