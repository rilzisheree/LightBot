const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GREEN } = require('../../utils/logger');
const GlobalBan = require('../../models/GlobalBan');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('globalbanlist')
    .setDescription('View all globally banned users (Owner only)'),

  async execute(interaction) {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      return interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
    }

    const bans = await GlobalBan.find().sort({ bannedAt: -1 }).limit(25);

    if (bans.length === 0) {
      return interaction.reply({ content: 'ℹ️ No users are currently globally banned.', ephemeral: true });
    }

    const list = bans
      .map((b, i) =>
        `**${i + 1}.** ${b.username || 'Unknown'} (\`${b.userId}\`)\n> **Reason:** ${b.reason}\n> **Banned by:** ${b.bannedBy} | <t:${Math.floor(new Date(b.bannedAt).getTime() / 1000)}:R>`
      )
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle('🌐 Global Ban List')
      .setDescription(list)
      .setFooter({ text: `Showing ${bans.length} entry/entries` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
