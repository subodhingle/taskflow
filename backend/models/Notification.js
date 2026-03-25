const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['task', 'meeting', 'system', 'announcement'], default: 'system' },
  readStatus: { type: Boolean, default: false },
  link: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
