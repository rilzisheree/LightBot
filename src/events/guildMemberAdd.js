const GlobalBan = require('../models/GlobalBan');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const ban = await GlobalBan.findOne({ userId: member.id });
    if (ban) {
      member.ban({ reason: `[GLOBAL BAN] ${ban.reason}` }).catch(() => {});
    }
  },
};
