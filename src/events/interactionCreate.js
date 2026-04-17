const { EmbedBuilder } = require('discord.js');
const { sendGlobalLog, GREEN } = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);

      // Log command usage globally
      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle('⚙️ Command Used')
        .addFields(
          { name: 'Command', value: `/${interaction.commandName}`, inline: true },
          { name: 'User', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
          { name: 'Server', value: interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'DM', inline: false },
          { name: 'Channel', value: interaction.channel ? `<#${interaction.channel.id}>` : 'Unknown', inline: true }
        )
        .setTimestamp();

      await sendGlobalLog(client, embed);
    } catch (error) {
      console.error(`Error executing /${interaction.commandName}:`, error);
      const msg = { content: '❌ An error occurred while executing this command.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => {});
      } else {
        await interaction.reply(msg).catch(() => {});
      }
    }
  },
};
