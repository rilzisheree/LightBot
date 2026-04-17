const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message as the bot')
    .addStringOption(o => o.setName('message').setDescription('Message to send').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel to send the message in'))
    .addStringOption(o => o.setName('replyto').setDescription('Message ID to reply to')),

  async execute(interaction) {
    if (!(await hasPermission(interaction, 'say'))) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const replyToId = interaction.options.getString('replyto');

    try {
      if (replyToId) {
        const targetMsg = await channel.messages.fetch(replyToId);
        await targetMsg.reply({ content: message });
      } else {
        await channel.send({ content: message });
      }

      await interaction.reply({ content: '✅ Message sent.', ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed to send: ${err.message}`, ephemeral: true });
    }
  },
};
