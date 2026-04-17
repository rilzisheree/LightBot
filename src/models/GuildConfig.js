const mongoose = require('mongoose');

const allowedUserSchema = new mongoose.Schema({
  userId: String,
  commands: [String],
});

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  logChannelId: { type: String, default: null },
  allowedUsers: [allowedUserSchema],
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
