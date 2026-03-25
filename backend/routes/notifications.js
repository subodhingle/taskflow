const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all  <-- must be BEFORE /:id/read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { readStatus: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id, { readStatus: true }, { new: true }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
