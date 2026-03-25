const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const { protect, hrOnly } = require('../middleware/auth');

// POST /api/meetings
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { title, participants, date, time, endTime, link, agenda } = req.body;

    if (!title || !date || !time) return res.status(400).json({ message: 'Title, date and time are required' });
    if (!participants || participants.length === 0) return res.status(400).json({ message: 'Select at least one participant' });

    // Conflict check: same participant, same date, same time
    const meetingDate = new Date(date);
    const dayStart = new Date(meetingDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(meetingDate); dayEnd.setHours(23, 59, 59, 999);

    const conflicts = await Meeting.find({
      participants: { $in: participants },
      date: { $gte: dayStart, $lte: dayEnd },
      time,
      status: { $ne: 'cancelled' },
    }).populate('participants', 'name');

    if (conflicts.length > 0) {
      const names = conflicts.flatMap(m => m.participants.map(p => p.name));
      return res.status(409).json({
        message: `Time slot unavailable: ${[...new Set(names)].join(', ')} already have a meeting at ${time}`,
      });
    }

    const meeting = await Meeting.create({
      title, participants, date, time, endTime: endTime || '', link: link || '', agenda: agenda || '',
      createdBy: req.user._id,
    });

    const io = req.app.get('io');
    for (const userId of participants) {
      const notif = await Notification.create({
        userId,
        message: `Meeting scheduled: "${title}" on ${new Date(date).toDateString()} at ${time}`,
        type: 'meeting',
      });
      io.to(userId.toString()).emit('notification', notif);
    }

    const populated = await Meeting.findById(meeting._id).populate('participants createdBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    console.error('POST /meetings error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/meetings
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'hr' ? {} : { participants: req.user._id };
    const meetings = await Meeting.find(filter)
      .populate('participants createdBy', 'name email')
      .sort({ date: 1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/meetings/:id
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid meeting ID' });
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('participants createdBy', 'name email');
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/meetings/:id
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid meeting ID' });
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meeting deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
