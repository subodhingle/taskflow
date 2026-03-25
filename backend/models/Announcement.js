const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['low', 'normal', 'urgent'], default: 'normal' },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
