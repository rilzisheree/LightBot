const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../../utils/permissions');
const { GREEN } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('Show the list of banned users in this server'),

  async execute(interaction) {
    if (!(await hasPermission(interaction, 'banlist'))) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const bans = await interaction.guild.bans.fetch();

      if (bans.size === 0) {
        return interaction.editReply({ content: 'ℹ️ No users are currently banned in this server.' });
      }

      const list = bans
        .first(20)
        .map((ban, i) => `**${i + 1}.** ${ban.user.tag} (\`${ban.user.id}\`)\n> ${ban.reason || 'No reason'}`)
        .join('\n\n');

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle(`🔨 Ban List — ${interaction.guild.name}`)
        .setDescription(list)
        .setFooter({ text: `Total bans: ${bans.size}${bans.size > 20 ? ' (showing first 20)' : ''}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: `❌ Failed to fetch ban list: ${err.message}` });
    }
  },
};
