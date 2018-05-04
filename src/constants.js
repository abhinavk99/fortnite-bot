const fortnite = require('fortnite.js');

module.exports = Object.freeze({
  PC: 'pc',
  XBOX: 'xbl',
  PS4: 'psn',
  SOLO: {
    top: [10, 25],
    id: 'p2'
  },
  DUO: {
    top: [5, 12],
    id: 'p10'
  },
  SQUAD: {
    top: [3, 6],
    id: 'p9'
  },
  SOLO_S: {
    top: [10, 25],
    id: 'curr_p2'
  },
  DUO_S: {
    top: [5, 12],
    id: 'curr_p10'
  },
  SQUAD_S: {
    top: [3, 6],
    id: 'curr_p9'
  },
  DISCORD_COLOR: 0x761FA1,
  START_MSG: `/user username for information on the player
/pc username for information on the player on PC platform
/xbox username for information on the player on XBOX platform
/ps4 username for information on the player on PS4 platform
/season4 or /s4 username for all season 3 information on the player
/solo username for player's lifetime solo stats
/duo username for player's lifetime duo stats
/squad username for player's lifetime squad stats
/solos4 username for player's season 3 solo stats
/duos4 username for player's season 3 duo stats
/squads4 username for player's season 3 squad stats
/recent username for player's recent match information`
});