const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../../utils/permissions');
const { GREEN } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a direct message to a user from the bot')
    .addUserOption(o => o.setName('user').setDescription('User to DM').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Message to send').setRequired(true)),

  async execute(interaction) {
    if (!(await hasPermission(interaction, 'dm'))) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const message = interaction.options.getString('message');

    try {
      await target.send({ content: message });

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle('📩 DM Sent')
        .addFields(
          { name: 'Recipient', value: `<@${target.id}> (${target.tag})`, inline: true },
          { name: 'Sender', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Message', value: message }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `❌ Could not DM this user. They may have DMs disabled.`, ephemeral: true });
    }
  },
};
