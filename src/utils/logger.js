const GlobalConfig = require('../models/GlobalConfig');

const GREEN = 0x1a7a1a;

async function getAllLogChannels(client) {
  const config = await GlobalConfig.findOne({ key: 'globalLogChannels' });
  if (!config || !Array.isArray(config.value) || config.value.length === 0) return [];

  const channels = [];
  for (const { guildId, channelId } of config.value) {
    try {
      const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId);
      const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId);
      if (channel) channels.push(channel);
    } catch {
      // channel/guild unreachable, skip
    }
  }
  return channels;
}

async function sendGlobalLog(client, embed) {
  const channels = await getAllLogChannels(client);
  for (const channel of channels) {
    channel.send({ embeds: [embed] }).catch(() => {});
  }
}

module.exports = { GREEN, sendGlobalLog, getAllLogChannels };
