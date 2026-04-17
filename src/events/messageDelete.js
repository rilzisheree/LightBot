const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendGlobalLog, GREEN } = require('../utils/logger');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (!message.guild || message.author?.bot) return;

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle('🗑️ Message Deleted')
      .addFields(
        { name: 'Server', value: `${message.guild.name} (${message.guild.id})`, inline: true },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Author', value: message.author ? `<@${message.author.id}> (${message.author.tag})` : 'Unknown', inline: false },
        { name: 'Content', value: message.content || '*[No text content]*', inline: false }
      )
      .setTimestamp();

    await sendGlobalLog(client, embed);
  },
};
