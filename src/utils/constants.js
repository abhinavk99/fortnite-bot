module.exports = Object.freeze({
  PC: 'pc',
  XBOX: 'xbl',
  PS4: 'psn',
  DISCORD_COLOR: 0x761FA1,
  BASE_URL: 'https://fortnitetracker.com/profile',
  LEADERBOARDS_URL: 'https://fortnitetracker.com/leaderboards',
  START_MSG: `/user <username> for information on the player
/pc <username> for information on the player on PC platform
/xbox <username> for information on the player on XBOX platform
/ps4 <username> for information on the player on PS4 platform
/season4 or /s5 <username> for all season 4 information on the player
/season5 or /s5 <username> for all season 5 information on the player
/solo <username> for player's lifetime solo stats
/duo <username> for player's lifetime duo stats
/squad <username> for player's lifetime squad stats
/solos4 or /solos5 <username> for player's season 4 or 5 solo stats
/duos4 or /duos5 <username> for player's season 4 or 5duo stats
/squads4 or /squads5 <username> for player's season 4 or 5 squad stats
/recent or /rold <username> for player's recent match information
/compare <username1>, <username2> to compare two players
/rating <username> for player's TRN rating stats
/kd <username> for player's K/D ratio stats
/winrate <username> for player's win rate stats
/leaderboards for leaderboard data

You can end any command (except /set, /pc, /xbox, /ps4, /compare) with pc, xbox, or ps4 to specify the platform to search for the user.`
});