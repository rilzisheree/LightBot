const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../../utils/permissions');
const { GREEN } = require('../../utils/logger');
const Warn = require('../../models/Warn');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnclear')
    .setDescription('Clear all warnings for a user in this server')
    .addUserOption(o => o.setName('user').setDescription('User to clear warnings for').setRequired(true)),

  async execute(interaction) {
    if (!(await hasPermission(interaction, 'warnclear'))) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');

    const result = await Warn.findOneAndDelete({ userId: target.id, guildId: interaction.guildId });

    if (!result) {
      return interaction.reply({ content: `ℹ️ <@${target.id}> has no warnings in this server.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle('✅ Warnings Cleared')
      .addFields(
        { name: 'User', value: `<@${target.id}> (${target.tag})`, inline: true },
        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Warnings Removed', value: `${result.warns.length}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
