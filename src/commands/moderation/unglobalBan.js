const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GREEN } = require('../../utils/logger');
const GlobalBan = require('../../models/GlobalBan');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unglobalban')
    .setDescription('Remove a global ban from a user (Owner only)')
    .addStringOption(o => o.setName('userid').setDescription('User ID to un-global-ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for removal')),

  async execute(interaction, client) {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      return interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
    }

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const ban = await GlobalBan.findOneAndDelete({ userId });
    if (!ban) {
      return interaction.reply({ content: `❌ No global ban found for user ID \`${userId}\`.`, ephemeral: true });
    }

    await interaction.deferReply();

    let unbanned = 0;
    let failed = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        await guild.members.unban(userId, reason);
        unbanned++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle('✅ Global Ban Removed')
      .addFields(
        { name: 'User ID', value: userId, inline: true },
        { name: 'Original Username', value: ban.username || 'Unknown', inline: true },
        { name: 'Reason', value: reason },
        { name: 'Unbanned from', value: `${unbanned} server(s)`, inline: true },
        { name: 'Failed', value: `${failed} server(s)`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
