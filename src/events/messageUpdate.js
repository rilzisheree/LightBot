const { EmbedBuilder } = require('discord.js');
const { sendGlobalLog, GREEN } = require('../utils/logger');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle('✏️ Message Edited')
      .addFields(
        { name: 'Server', value: `${newMessage.guild.name} (${newMessage.guild.id})`, inline: true },
        { name: 'Channel', value: `<#${newMessage.channel.id}>`, inline: true },
        { name: 'Author', value: `<@${newMessage.author.id}> (${newMessage.author.tag})`, inline: false },
        { name: 'Before', value: oldMessage.content || '*[No text]*', inline: false },
        { name: 'After', value: newMessage.content || '*[No text]*', inline: false },
        { name: 'Jump', value: `[Click here](${newMessage.url})`, inline: false }
      )
      .setTimestamp();

    await sendGlobalLog(client, embed);
  },
};
