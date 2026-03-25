const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  date: { type: Date, required: true },
  time: { type: String, required: true },
  endTime: { type: String, default: '' },
  link: { type: String, default: '' },
  agenda: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
