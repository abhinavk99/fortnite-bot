require('dotenv').config()
const fortnite = require('fortnite.js');

const client = new fortnite(process.env.FORTNITE_KEY);

// Format global stats for message
module.exports.formatGlobal = function formatGlobal(user, platform) {
  return new Promise((resolve, reject) => {
    client.get(user, platform, true)
      .then(info => {
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

        var kg = (parseInt(stats[10].value) / parseInt(stats[7].value)).toFixed(2);
        res += `Kills/Game: ${kg}\n`;
        // res += `Kills/Minute: ${stats[12].value}\n`;

        // Shows some limited data for the game modes
        var modes = { 'Solo': 'p2', 'Duo': 'p10', 'Squad': 'p9' };
        for (var mode in modes) {
          modeStats = info.stats[modes[mode]];
          if (modeStats !== undefined) {
            res += `\n${mode} matches played: ${modeStats.matches.value}\n`;
            res += `${mode} wins: ${modeStats.top1.value}\n`;
            res += `${mode} kills: ${modeStats.kills.value}\n`;
            // var avgSeconds = parseFloat(modeStats.avgTimePlayed.value);
            // // Gets time played by doing average time played * number of matches
            // var seconds = modeStats.matches.valueInt * avgSeconds;
            // res += `${mode} time played:${formatSeconds(seconds, false)}\n`;
          }
        }

        return resolve(res);
      }).catch(err => {
        console.log(err);
        if (err === 'HTTP Player Not Found')
          return reject('User not found.');
        else
          return reject('Error found when getting user info.');
      });
  });
}

// Format solo/duo/squad lifetime/season3 stats for message
module.exports.formatModes = function formatModes(user, mode, nums, platform, currSeason) {
  return new Promise((resolve, reject) => {
    client.get(user, platform, true)
      .then(info => {
        // The API data stores data for each of the modes with the mapped names
        var modes = {
          'Solo': 'p2',
          'Duo': 'p10',
          'Squad': 'p9',
          'Solos3': 'curr_p2',
          'Duos3': 'curr_p10',
          'Squads3': 'curr_p9'
        };
        var stats = info.stats[modes[mode]]; // Data for the mode
        if (!stats.matches) // No matches exist for the mode
          return resolve('User has never played ' + mode + '.');
        console.log(stats);

        var res = currSeason ? 'Season 3 ' : '';
        // Cuts off the 's3' at the end for current season
        mode = currSeason ? mode.slice(0, -2) : mode;
        res += `${mode} stats for ${info.epicUserHandle}:\n`;

        res += `Platform: ${info.platformNameLong}\n\n`;
        res += `Matches played: ${stats.matches.value}\n`;

        // Only shows time played and average time if not current season
        // Current season shows average time played incorrectly (most likely)
        // if (!currSeason) {
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

        if (stats.winRatio !== undefined)
          res += `Win Rate: ${stats.winRatio.displayValue}%\n`;
        else
          res += `Win Rate: 0%\n`;

        res += `Kills: ${stats.kills.value}\n`;
        res += `K/D Ratio: ${stats.kd.displayValue}\n`;
        res += `Kills/Game: ${stats.kpg.displayValue}\n`;

        return resolve(res);
      }).catch(err => {
        console.log(err);
        if (err === 'HTTP Player Not Found')
          return reject('User not found.');
        else
          return reject('Error found when getting user info.');
      });
  });
}

// Format recent matches stats for message
module.exports.formatRecent = function formatRecent(user, platform) {
  return new Promise((resolve, reject) => {
    client.get(user, platform, true)
      .then(info => {
        console.log(info);
        var matches = info.recentMatches;
        // Convert the API naming of modes to the actual name of the modes
        var modes = { 'p2': 'Solo', 'p10': 'Duo', 'p9': 'Squad' };

        var res = `Recent matches for ${info.epicUserHandle}:\n`;
        res += `Platform: ${info.platformNameLong}\n\n`;

        matches.forEach(data => {
          // Make it plural if not 1
          var m = data.matches == 1 ? 'match' : 'matches';
          var w = data.top1 == 1 ? 'win' : 'wins';
          var k = data.kills == 1 ? 'kill' : 'kills';

          res += `${modes[data.playlist]} - ${data.matches} ${m} - `;
          res += `${data.top1} ${w} - ${data.kills} ${k} -`;

          // Get time difference from match time and now
          var date = new Date(data.dateCollected);
          var diffSecs = (Date.now() - date.getTime()) / 1000;
          res += `${formatSeconds(diffSecs, true)} ago\n`;
        });

        return resolve(res);
      }).catch(err => {
        console.log(err);
        if (err === 'HTTP Player Not Found')
          return reject('User not found.');
        else
          return reject('Error found when getting user info.');
      });
  });
}

// Format all season 3 stats for message
module.exports.formatSeason = function formatSeason(user, platform) {
  return new Promise((resolve, reject) => {
    client.get(user, platform, true)
      .then(info => {
        console.log(info);
        stats = info.lifeTimeStats;

        var modes = { 'Solo': 'curr_p2', 'Duo': 'curr_p10', 'Squad': 'curr_p9' };

        var matches = 0;
        var wins = 0;
        var sumPlaces1 = 0;
        var sumPlaces2 = 0;
        var kills = 0;
        var deaths = 0;

        var modeRes = '';

        for (var mode in modes) {
          modeStats = info.stats[modes[mode]];
          if (modeStats !== undefined) {
            // Sums up the values needed to show all season 3 stats
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
        }

        var res = `Season 3 stats for ${info.epicUserHandle}:\n`;
        res += `Platform: ${info.platformNameLong}\n\n`;
        res += `Matches played: ${matches}\n`;
        res += `Wins: ${wins}\n`;
        res += `Times in top 3/5/10: ${sumPlaces1}\n`;
        res += `Times in top 6/12/25: ${sumPlaces2}\n`;
        res += `Win Rate: ${(wins / matches * 100).toFixed(2)}%\n`;
        res += `Kills: ${kills}\n`;
        res += `K/D Ratio: ${(kills / deaths).toFixed(2)}\n`;
        res += `Kills/Game: ${(kills / matches).toFixed(2)}\n`;

        return resolve(res + modeRes);
      }).catch(err => {
        console.log(err);
        if (err === 'HTTP Player Not Found')
          return reject('User not found.');
        else
          return reject('Error found when getting user info.');
      });
  });
}

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
