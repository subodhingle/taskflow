const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, hrOnly } = require('../middleware/auth');

// POST /api/announcements
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

    const announcement = await Announcement.create({
      title, content, priority: priority || 'normal', createdBy: req.user._id,
    });

    // Broadcast notification to all employees
    const employees = await User.find({ role: 'employee' }).select('_id');
    const io = req.app.get('io');
    for (const emp of employees) {
      const notif = await Notification.create({
        userId: emp._id,
        message: `📢 Announcement: "${title}"`,
        type: 'announcement',
      });
      io.to(emp._id.toString()).emit('notification', notif);
    }

    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (err) {
    console.error('POST /announcements error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/announcements
router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid ID' });
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
