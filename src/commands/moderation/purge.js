const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../../utils/permissions');
const { GREEN } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a number of messages from this channel')
    .addIntegerOption(o =>
      o.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user')),

  async execute(interaction) {
    if (!(await hasPermission(interaction, 'purge'))) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount');
    const filterUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: 100 });

      if (filterUser) {
        messages = messages.filter(m => m.author.id === filterUser.id).first(amount);
      } else {
        messages = messages.first(amount);
      }

      const deleted = await interaction.channel.bulkDelete(messages, true);

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle('🧹 Messages Purged')
        .addFields(
          { name: 'Deleted', value: `${deleted.size} messages`, inline: true },
          { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          ...(filterUser ? [{ name: 'Filtered User', value: `<@${filterUser.id}>`, inline: true }] : [])
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: `❌ Failed to purge: ${err.message}` });
    }
  },
};
