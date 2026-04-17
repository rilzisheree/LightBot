const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../../utils/permissions');
const { GREEN } = require('../../utils/logger');
const Warn = require('../../models/Warn');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for warning')),

  async execute(interaction) {
    if (!(await hasPermission(interaction, 'warn'))) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    let warnDoc = await Warn.findOne({ userId: target.id, guildId: interaction.guildId });
    if (!warnDoc) {
      warnDoc = new Warn({ userId: target.id, guildId: interaction.guildId, warns: [] });
    }

    warnDoc.warns.push({ reason, moderator: interaction.user.tag });
    await warnDoc.save();

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle('⚠️ Member Warned')
      .addFields(
        { name: 'User', value: `<@${target.id}> (${target.tag})`, inline: true },
        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Reason', value: reason },
        { name: 'Total Warnings', value: `${warnDoc.warns.length}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // DM the warned user
    target.send({ content: `⚠️ You have been warned in **${interaction.guild.name}**.\n**Reason:** ${reason}` }).catch(() => {});
  },
};
