const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { GREEN } = require('../../utils/logger');
const GlobalConfig = require('../../models/GlobalConfig');

const KEY = 'globalLogChannels';

async function getList() {
  const doc = await GlobalConfig.findOne({ key: KEY });
  return doc?.value ?? [];
}

async function saveList(list) {
  await GlobalConfig.findOneAndUpdate(
    { key: KEY },
    { key: KEY, value: list },
    { upsert: true, new: true }
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('Manage global log channels (Owner only)')
    .addSubcommand(sub =>
      sub.setName('setglobal')
        .setDescription('Add a channel to receive global logs from all servers')
        .addChannelOption(o =>
          o.setName('channel').setDescription('Channel to add as a log channel').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a channel from the global log list')
        .addChannelOption(o =>
          o.setName('channel').setDescription('Channel to remove').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all currently configured global log channels')
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      return interaction.reply({ content: '❌ Only the bot owner can manage global log channels.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    // --- SETGLOBAL ---
    if (sub === 'setglobal') {
      const channel = interaction.options.getChannel('channel');
      const list = await getList();

      const already = list.some(e => e.channelId === channel.id);
      if (already) {
        return interaction.reply({ content: `ℹ️ <#${channel.id}> is already a global log channel.`, ephemeral: true });
      }

      list.push({ guildId: interaction.guildId, channelId: channel.id, guildName: interaction.guild.name });
      await saveList(list);

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle('✅ Global Log Channel Added')
        .addFields(
          { name: 'Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'Total Log Channels', value: `${list.length}`, inline: true }
        )
        .setDescription('All events from all servers will be sent here.')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // --- REMOVE ---
    if (sub === 'remove') {
      const channel = interaction.options.getChannel('channel');
      const list = await getList();

      const index = list.findIndex(e => e.channelId === channel.id);
      if (index === -1) {
        return interaction.reply({ content: `ℹ️ <#${channel.id}> is not in the global log list.`, ephemeral: true });
      }

      list.splice(index, 1);
      await saveList(list);

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle('🗑️ Global Log Channel Removed')
        .addFields(
          { name: 'Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Remaining Log Channels', value: `${list.length}`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // --- LIST ---
    if (sub === 'list') {
      const list = await getList();

      if (list.length === 0) {
        return interaction.reply({ content: 'ℹ️ No global log channels are configured yet.\nUse `/setlogchannel setglobal #channel` to add one.', ephemeral: true });
      }

      const lines = list.map((e, i) =>
        `**${i + 1}.** <#${e.channelId}> — ${e.guildName || 'Unknown Server'} (\`${e.guildId}\`)`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setColor(GREEN)
        .setTitle(`📋 Global Log Channels (${list.length})`)
        .setDescription(lines)
        .setFooter({ text: 'All logs from every server are sent to these channels.' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
