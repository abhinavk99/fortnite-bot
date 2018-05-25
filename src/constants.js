module.exports = Object.freeze({
  PC: 'pc',
  XBOX: 'xbl',
  PS4: 'psn',
  MODES: [
    'Solo',
    'Duo',
    'Squad',
    'Season 3 Solo',
    'Season 3 Duo',
    'Season 3 Squad',
    'Season 4 Solo',
    'Season 4 Duo',
    'Season 4 Squad'
  ],
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
  SOLOS3: {
    top: [10, 25],
    id: 'prior_p2'
  },
  DUOS3: {
    top: [5, 12],
    id: 'prior_p10'
  },
  SQUADS3: {
    top: [3, 6],
    id: 'prior_p9'
  },
  SOLOS4: {
    top: [10, 25],
    id: 'curr_p2'
  },
  DUOS4: {
    top: [5, 12],
    id: 'curr_p10'
  },
  SQUADS4: {
    top: [3, 6],
    id: 'curr_p9'
  },
  DISCORD_COLOR: 0x761FA1,
  BASE_URL: 'https://fortnitetracker.com/profile',
  ERRORS: {
    'HTTP Player Not Found': 'User not found.',
    'HTTP Error: 503 Service Unavailable': 'Fortnite Tracker API is unavailable.'
  },
  GENERIC_ERROR: 'Error found when getting user info.',
  MD_PARSE_ERROR_INPUT: 'Bad Request: can\'t parse entities: ',
  MD_PARSE_ERROR_OUTPUT: 'Error with parsing username in Markdown. Try using /rold instead.',
  START_MSG: `/user <username> for information on the player
/pc <username> for information on the player on PC platform
/xbox <username> for information on the player on XBOX platform
/ps4 <username> for information on the player on PS4 platform
/season3 or /s3 <username> for all season 3 information on the player
/season4 or /s4 <username> for all season 4 information on the player
/solo <username> for player's lifetime solo stats
/duo <username> for player's lifetime duo stats
/squad <username> for player's lifetime squad stats
/solos3 or /solos4 <username> for player's season 4 solo stats
/duos3 or /duos4 <username> for player's season 4 duo stats
/squads3 or /squads4 <username> for player's season 4 squad stats
/recent or /rold <username> for player's recent match information
/rating <username> for player's TRN rating stats
/kd <username> for player's K/D ratio stats

You can end any command (except /set, /pc, /xbox, /ps4) with pc, xbox, or ps4 to specify the platform to search for the user.`
});