const mongoose = require('mongoose');

const globalBanSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: String,
  reason: { type: String, default: 'No reason provided' },
  bannedBy: String,
  bannedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GlobalBan', globalBanSchema);
