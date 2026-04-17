const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../../utils/permissions');
const { GREEN } = require('../../utils/logger');
const Warn = require('../../models/Warn');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkwarn')
    .setDescription('Check warnings for a user in this server')
    .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(true)),

  async execute(interaction) {
    if (!(await hasPermission(interaction, 'checkwarn'))) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const warnDoc = await Warn.findOne({ userId: target.id, guildId: interaction.guildId });

    if (!warnDoc || warnDoc.warns.length === 0) {
      return interaction.reply({ content: `✅ <@${target.id}> has no warnings in this server.` });
    }

    const warnList = warnDoc.warns
      .map((w, i) => `**#${i + 1}** — ${w.reason}\nModerator: ${w.moderator} | Date: <t:${Math.floor(new Date(w.warnedAt).getTime() / 1000)}:R>`)
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle(`⚠️ Warnings for ${target.tag}`)
      .setDescription(warnList)
      .setFooter({ text: `Total: ${warnDoc.warns.length} warning(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
