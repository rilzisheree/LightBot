const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GREEN } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverlist')
    .setDescription('List all servers the bot is in (Owner only)'),

  async execute(interaction, client) {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      return interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
    }

    const guilds = client.guilds.cache;

    const list = guilds
      .map((g, i) => `**${g.name}**\nID: \`${g.id}\` | Members: ${g.memberCount}`)
      .join('\n\n');

    const chunks = [];
    let current = '';
    for (const line of list.split('\n\n')) {
      if ((current + '\n\n' + line).length > 3800) {
        chunks.push(current);
        current = line;
      } else {
        current += (current ? '\n\n' : '') + line;
      }
    }
    if (current) chunks.push(current);

    const embeds = chunks.map((chunk, idx) =>
      new EmbedBuilder()
        .setColor(GREEN)
        .setTitle(idx === 0 ? `🌐 Server List (${guilds.size} total)` : `🌐 Server List (continued)`)
        .setDescription(chunk)
        .setTimestamp()
    );

    await interaction.reply({ embeds: embeds.slice(0, 10), ephemeral: true });
  },
};
