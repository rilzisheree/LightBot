const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GREEN } = require('../../utils/logger');
const GlobalBan = require('../../models/GlobalBan');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('globalban')
    .setDescription('Globally ban a user from all servers the bot is in (Owner only)')
    .addUserOption(o => o.setName('user').setDescription('User to globally ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for global ban')),

  async execute(interaction, client) {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      return interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await interaction.deferReply();

    const existing = await GlobalBan.findOne({ userId: target.id });
    if (existing) {
      return interaction.editReply({ content: `❌ <@${target.id}> is already globally banned.` });
    }

    await GlobalBan.create({
      userId: target.id,
      username: target.tag,
      reason,
      bannedBy: interaction.user.tag,
    });

    let banned = 0;
    let failed = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        await guild.members.ban(target.id, { reason: `[GLOBAL BAN] ${reason}` });
        banned++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle('🌐 Global Ban Issued')
      .addFields(
        { name: 'User', value: `<@${target.id}> (${target.tag})`, inline: true },
        { name: 'Reason', value: reason },
        { name: 'Banned from', value: `${banned} server(s)`, inline: true },
        { name: 'Failed', value: `${failed} server(s)`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
