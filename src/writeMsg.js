/**
 * Methods to write messages given the data
 */

const constants = require('./constants');

module.exports = {
  // Writes the message for global stats
  writeGlobalMsg: info => {
    console.log(info);
    stats = info.lifeTimeStats;

    var res = `Lifetime stats for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;
    res += `Matches played: ${stats[7].value}\n`;
    // res += `Time played: ${stats[13].value}\n`;
    // res += `Avg Survival Time: ${stats[14].value}\n`;
    res += `Wins: ${stats[8].value}\n`;

    var sumPlaces1 = parseInt(stats[0].value) + parseInt(stats[1].value)
      + parseInt(stats[2].value); // Adds up times in top 3, 5, 10
    var sumPlaces2 = parseInt(stats[3].value) + parseInt(stats[4].value)
      + parseInt(stats[5].value); // Adds up times in top 6, 12, 25
    res += `Times in top 3/5/10: ${sumPlaces1}\n`;
    res += `Times in top 6/12/25: ${sumPlaces2}\n`;

    res += `Win Rate: ${stats[9].value}\n`;
    res += `Kills: ${stats[10].value}\n`;
    res += `K/D Ratio: ${stats[11].value}\n`;

    if (parseInt(stats[7].value) == 0)
      var kg = 0;
    else
      var kg = (parseInt(stats[10].value) / parseInt(stats[7].value)).toFixed(2);
    res += `Kills/Game: ${kg}\n`;
    // res += `Kills/Minute: ${stats[12].value}\n`;

    // Shows some limited data for the game modes
    ['Solo', 'Duo', 'Squad'].forEach(mode => {
      modeStats = info.stats[constants[mode.toUpperCase()].id];
      if (modeStats) {
        res += `\n${mode} matches played: ${modeStats.matches.value}\n`;
        res += `${mode} wins: ${modeStats.top1.value}\n`;
        res += `${mode} kills: ${modeStats.kills.value}\n`;
        // var avgSeconds = parseFloat(modeStats.avgTimePlayed.value);
        // // Gets time played by doing average time played * number of matches
        // var seconds = modeStats.matches.valueInt * avgSeconds;
        // res += `${mode} time played:${formatSeconds(seconds, false)}\n`;
      }
    });

    return res;
  },

  // Writes the message for modes stats
  writeModesMsg: (info, season, mode, nums) => {
    // The API data stores data for each of the modes with the mapped names
    var formattedMode;
    if (mode.endsWith('s3') || mode.endsWith('s4'))
      formattedMode = `${mode.substring(0, mode.length - 2)}_S`.toUpperCase();
    else
      formattedMode = mode.toUpperCase();
    var stats = info.stats[constants[formattedMode].id]; // Data for the mode
    if (!(stats && stats.matches)) // No matches exist for the mode
      return 'User has never played ' + mode + '.';
    console.log(stats);

    var res = season != '' ? `Season ${season} ` : '';
    // Cuts off the 's3' at the end for current season
    mode = season != '' ? mode.slice(0, -2) : mode;
    res += `${mode} stats for ${info.epicUserHandle}:\n`;

    res += `Platform: ${info.platformNameLong}\n\n`;
    res += `Matches played: ${stats.matches.value}\n`;

    // Only shows time played and average time if not current season
    // Current season shows average time played incorrectly (most likely)
    // if (!season) {
    //   var avgSeconds = parseFloat(stats.avgTimePlayed.value);
    //   var seconds = stats.matches.valueInt * avgSeconds;
    //   res += `Time played:${formatSeconds(seconds, false)}\n`;
    //   res += `Avg Survival Time: ${stats.avgTimePlayed.displayValue}\n`;
    // }

    res += `Wins: ${stats.top1.value}\n`;

    // Gets times in top x for the 2 numbers passed in the array
    nums.forEach(num => {
      res += `Times in top ${num}: ${stats[`top${num}`].value}\n`;
    });

    if (stats.winRatio)
      res += `Win Rate: ${stats.winRatio.displayValue}%\n`;
    else
      res += `Win Rate: 0%\n`;

    res += `Kills: ${stats.kills.value}\n`;
    res += `K/D Ratio: ${stats.kd.displayValue}\n`;
    res += `Kills/Game: ${stats.kpg.displayValue}\n`;

    return res;
  },

  // Writes the message for recent stats
  writeRecentMsg: info => {
    console.log(info);
    var matches = info.recentMatches;

    var res = `Recent matches for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;

    matches.forEach(data => {
      // Make it plural if not 1
      var m = data.matches == 1 ? 'match' : 'matches';
      var w = data.top1 == 1 ? 'win' : 'wins';
      var k = data.kills == 1 ? 'kill' : 'kills';

      // Get mode from the ID (p2, p10, p9)
      var mode = ['Solo', 'Duo', 'Squad'].find(mode =>
        constants[mode.toUpperCase()].id == data.playlist
      );
      res += `${mode} - ${data.matches} ${m} - `;

      res += `${data.top1} ${w} - ${data.kills} ${k} -`;

      // Get time difference from match time and now
      var date = new Date(data.dateCollected);
      var diffSecs = (Date.now() - date.getTime()) / 1000;
      res += `${formatSeconds(diffSecs, true)} ago\n`;
    });

    return res;
  },

  // Writes the message for season stats
  writeSeasonMsg: (info, season) => {
    console.log(info);
    stats = info.lifeTimeStats;

    var matches = 0;
    var wins = 0;
    var sumPlaces1 = 0;
    var sumPlaces2 = 0;
    var kills = 0;
    var deaths = 0;

    var modeRes = '';

    ['Solo', 'Duo', 'Squad'].forEach(mode => {
      modeStats = info.stats[constants[`${mode.toUpperCase()}_S`].id];
      if (modeStats) {
        // Sums up the values needed to show all season stats
        matches += modeStats.matches.valueInt;
        wins += modeStats.top1.valueInt;
        sumPlaces1 += (modeStats.top3.valueInt + modeStats.top5.valueInt
          + modeStats.top10.valueInt);
        sumPlaces2 += (modeStats.top6.valueInt + modeStats.top12.valueInt
          + modeStats.top25.valueInt);
        kills += modeStats.kills.valueInt;
        deaths += (modeStats.kills.valueInt / modeStats.kd.valueDec);

        // Gets some mode data to display
        modeRes += `\n${mode} matches played: ${modeStats.matches.value}\n`;
        modeRes += `${mode} wins: ${modeStats.top1.value}\n`;
        modeRes += `${mode} kills: ${modeStats.kills.value}\n`;
      }
    });

    var res = `Season ${season} stats for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;
    res += `Matches played: ${matches}\n`;
    res += `Wins: ${wins}\n`;
    res += `Times in top 3/5/10: ${sumPlaces1}\n`;
    res += `Times in top 6/12/25: ${sumPlaces2}\n`;

    var wr = (matches == 0) ? 0 : (wins / matches * 100).toFixed(2);
    res += `Win Rate: ${wr}%\n`;

    res += `Kills: ${kills}\n`;

    if (deaths == 0)
      deaths++;
    res += `K/D Ratio: ${(kills / deaths).toFixed(2)}\n`;

    var kg = (matches == 0) ? 0 : (kills / matches).toFixed(2);
    res += `Kills/Game: ${kg}\n`;

    return res + modeRes;
  }
};

// Convert seconds to days, hours, minutes, and seconds
function formatSeconds(seconds, recent) {
  var days = Math.floor(seconds / (60 * 60 * 24)); // days
  seconds -= days * 60 * 60 * 24;
  var hrs = Math.floor(seconds / (60 * 60)); // hours
  seconds -= hrs * 60 * 60;
  var mnts = Math.floor(seconds / 60); // minutes
  seconds -= mnts * 60; // seconds

  var res = '';
  if (days < 0)
    days = 0;


  if (recent || days > 0) // Always shows days for current season, else if > 0
    res += (' ' + days + 'd');
  // Only shows hours and minutes if not for current season
  if (!recent && (hrs > 0 || days > 0)) // Shows hours if exists or days exists
    res += (' ' + hrs + 'h');
  if (!recent && (mnts > 0 || hrs > 0)) // Shows min if exists or hours exists
    res += (' ' + mnts + 'm');
  return res;
}