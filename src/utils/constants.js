const CURR_SEASON = 9;

module.exports = Object.freeze({
  CURR_SEASON: CURR_SEASON,
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
/season${CURR_SEASON} or /s${CURR_SEASON} <username> for all season ${CURR_SEASON} information on the player
/solo <username> for player's lifetime solo stats
/duo <username> for player's lifetime duo stats
/squad <username> for player's lifetime squad stats
/solos${CURR_SEASON} <username> for player's season ${CURR_SEASON} solo stats
/duos${CURR_SEASON} <username> for player's season ${CURR_SEASON} duo stats
/squads${CURR_SEASON} <username> for player's season ${CURR_SEASON} squad stats
/recent or /rold <username> for player's recent match information
/compare <username1>, <username2> to compare two players
/rating <username> for player's TRN rating stats
/kd <username> for player's K/D ratio stats
/winrate <username> for player's win rate stats
/leaderboards for leaderboard data
/challenges for current weekly challenges
/store for current store items
/matches for match history
/set <username> to save username and not specify username for other commands
/nick <nickname>, <username> to set a nickname for a username when searching
/deletenick <nickname> to delete a nickname that was set

You can end any command (except /set, /pc, /xbox, /ps4, /compare) with pc, xbox, or ps4 to specify the platform to search for the user.`
});