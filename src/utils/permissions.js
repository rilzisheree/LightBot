const GuildConfig = require('../models/GuildConfig');

async function hasPermission(interaction, commandName) {
  const ownerId = process.env.BOT_OWNER_ID;
  if (interaction.user.id === ownerId) return true;
  if (interaction.member && interaction.member.permissions.has('Administrator')) return true;

  const config = await GuildConfig.findOne({ guildId: interaction.guildId });
  if (!config) return false;

  const entry = config.allowedUsers.find(u => u.userId === interaction.user.id);
  if (!entry) return false;

  return entry.commands.includes(commandName) || entry.commands.includes('*');
}

module.exports = { hasPermission };
