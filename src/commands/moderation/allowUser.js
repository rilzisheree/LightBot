const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GREEN } = require('../../utils/logger');
const GuildConfig = require('../../models/GuildConfig');

const VALID_COMMANDS = [
  'ban', 'unban', 'purge', 'say', 'warn', 'warnclear', 'checkwarn',
  'dm', 'banlist', 'serverlist', 'globalban', 'unglobalban', 'globalbanlist', 'setlogchannel',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allowuser')
    .setDescription('Manage command permissions for a user')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Allow a user to use a specific command')
        .addUserOption(o => o.setName('user').setDescription('User to grant permission').setRequired(true))
        .addStringOption(o =>
          o.setName('command').setDescription('Command to allow').setRequired(true)
            .addChoices(...VALID_COMMANDS.map(c => ({ name: c, value: c })))
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a command permission from a user')
        .addUserOption(o => o.setName('user').setDescription('User to remove permission from').setRequired(true))
        .addStringOption(o =>
          o.setName('command').setDescription('Command to remove').setRequired(true)
            .addChoices(...VALID_COMMANDS.map(c => ({ name: c, value: c })))
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all allowed users and their commands')
    ),

  async execute(interaction) {
    const ownerId = process.env.BOT_OWNER_ID;
    const isOwner = interaction.user.id === ownerId;
    const isAdmin = interaction.member?.permissions.has('Administrator');

    if (!isOwner && !isAdmin) {
      return interaction.reply({ content: '❌ Only server admins or the bot owner can use this command.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    let config = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (!config) config = new GuildConfig({ guildId: interaction.guildId, allowedUsers: [] });

    if (sub === 'add') {
      const target = interaction.options.getUser('user');
      const command = interaction.options.getString('command');

      let entry = config.allowedUsers.find(u => u.userId === target.id);
      if (!entry) {
        config.allowedUsers.push({ userId: target.id, commands: [command] });
      } else if (!entry.commands.includes(command)) {
        entry.commands.push(command);
      } else {
        return interaction.reply({ content: `ℹ️ <@${target.id}> already has permission for \`${command}\`.`, ephemeral: true });
      }

      await config.save();

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle('✅ Permission Granted')
        .addFields(
          { name: 'User', value: `<@${target.id}> (${target.tag})`, inline: true },
          { name: 'Command', value: `\`/${command}\``, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const target = interaction.options.getUser('user');
      const command = interaction.options.getString('command');

      const entry = config.allowedUsers.find(u => u.userId === target.id);
      if (!entry || !entry.commands.includes(command)) {
        return interaction.reply({ content: `ℹ️ <@${target.id}> doesn't have permission for \`${command}\`.`, ephemeral: true });
      }

      entry.commands = entry.commands.filter(c => c !== command);
      if (entry.commands.length === 0) {
        config.allowedUsers = config.allowedUsers.filter(u => u.userId !== target.id);
      }

      await config.save();

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle('🗑️ Permission Removed')
        .addFields(
          { name: 'User', value: `<@${target.id}> (${target.tag})`, inline: true },
          { name: 'Command', value: `\`/${command}\``, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'list') {
      if (config.allowedUsers.length === 0) {
        return interaction.reply({ content: 'ℹ️ No users have been granted permissions in this server.', ephemeral: true });
      }

      const list = config.allowedUsers
        .map(u => `<@${u.userId}> — ${u.commands.map(c => `\`${c}\``).join(', ')}`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle('📋 Allowed Users')
        .setDescription(list)
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
