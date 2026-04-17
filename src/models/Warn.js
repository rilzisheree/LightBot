const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  warns: [
    {
      reason: { type: String, default: 'No reason provided' },
      moderator: String,
      warnedAt: { type: Date, default: Date.now },
    },
  ],
});

warnSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('Warn', warnSchema);
