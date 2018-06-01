/**
 * Methods to write messages given the data
 */

const constants = require('./constants');

module.exports = {
  // Writes the message for global stats
  writeGlobalMsg: info => {
    console.log(info);
    const stats = info.lifeTimeStats;

    let res = `Lifetime stats for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n`;

    const platform = info.platformName;
    const user = encodeURIComponent(info.epicUserHandle);
    res += `${constants.BASE_URL}/${platform}/${user}\n\n`;

    res += `Matches played: ${stats[7].value}\n`;
    // res += `Time played: ${stats[13].value}\n`;
    // res += `Avg Survival Time: ${stats[14].value}\n`;
    res += `Wins: ${stats[8].value}\n`;

    const sumPlaces1 = parseInt(stats[0].value) + parseInt(stats[1].value)
      + parseInt(stats[2].value); // Adds up times in top 3, 5, 10
    const sumPlaces2 = parseInt(stats[3].value) + parseInt(stats[4].value)
      + parseInt(stats[5].value); // Adds up times in top 6, 12, 25
    res += `Times in top 3/5/10: ${sumPlaces1}\n`;
    res += `Times in top 6/12/25: ${sumPlaces2}\n`;

    res += `Win Rate: ${stats[9].value}\n`;
    res += `Kills: ${stats[10].value}\n`;
    res += `K/D Ratio: ${stats[11].value}\n`;

    let kg;
    if (parseInt(stats[7].value) === 0)
      kg = 0;
    else
      kg = (parseInt(stats[10].value) / parseInt(stats[7].value)).toFixed(2);
    res += `Kills/Game: ${kg}\n`;
    // res += `Kills/Minute: ${stats[12].value}\n`;
    res += `Score: ${stats[6].value}\n`;

    // Shows some limited data for the game modes
    ['Solo', 'Duo', 'Squad'].forEach(mode => {
      modeStats = info.stats[constants[mode.toUpperCase()].id];
      if (modeStats) {
        res += `\n${mode} matches played: ${modeStats.matches.value}\n`;
        res += `${mode} wins: ${modeStats.top1.value}\n`;
        res += `${mode} kills: ${modeStats.kills.value}\n`;
        // let avgSeconds = parseFloat(modeStats.avgTimePlayed.value);
        // // Gets time played by doing average time played * number of matches
        // let seconds = modeStats.matches.valueInt * avgSeconds;
        // res += `${mode} time played:${formatSeconds(seconds, false)}\n`;
      }
    });

    return res;
  },

  // Writes the message for modes stats
  writeModesMsg: (info, { season, mode, top }) => {
    // The API data stores data for each of the modes with the mapped names
    const stats = info.stats[constants[mode.toUpperCase()].id]; // Data for the mode
    
    let res = season != '' ? `Season ${season} ` : '';
    // Cuts off the 's3' at the end for current season
    res += season != '' ? mode.slice(0, -2) : mode;

    if (!(stats && stats.matches)) // No matches exist for the mode
      return 'User has never played ' + res + '.';
    console.log(stats);

    res += ` stats for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;
    res += `Matches played: ${stats.matches.value}\n`;

    // Only shows time played and average time if not current season
    // Current season shows average time played incorrectly (most likely)
    // if (!season) {
    //   let avgSeconds = parseFloat(stats.avgTimePlayed.value);
    //   let seconds = stats.matches.valueInt * avgSeconds;
    //   res += `Time played:${formatSeconds(seconds, false)}\n`;
    //   res += `Avg Survival Time: ${stats.avgTimePlayed.displayValue}\n`;
    // }

    res += `Wins: ${stats.top1.value}\n`;

    // Gets times in top x for the 2 numbers passed in the array
    top.forEach(num => {
      res += `Times in top ${num}: ${stats[`top${num}`].value}\n`;
    });

    if (stats.winRatio)
      res += `Win Rate: ${stats.winRatio.displayValue}%\n`;
    else
      res += `Win Rate: 0%\n`;

    res += `Kills: ${stats.kills.value}\n`;
    res += `K/D Ratio: ${stats.kd.displayValue}\n`;
    res += `Kills/Game: ${stats.kpg.displayValue}\n`;
    res += `TRN Rating: ${stats.trnRating.displayValue}\n`;
    res += `Score: ${stats.score.displayValue}\n`;
    res += `Score/Match: ${stats.scorePerMatch.displayValue}\n`;

    return res;
  },

  // Creates a table for recent stats
  writeRecentMsg: info => {
    console.log(info);
    const matches = info.recentMatches;

    let res = `Recent matches for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}`;

    let table = [[], [], [], [], []];
    table[0].push('Mode');
    table[1].push('Matches');
    table[2].push('Wins');
    table[3].push('Kills');
    table[4].push('Time');
    let m, w, k, mode, date, diffSecs;
    matches.forEach(data => {
      // Make it plural if not 1
      m = data.matches === 1 ? 'match' : 'matches';
      w = data.top1 === 1 ? 'win' : 'wins';
      k = data.kills === 1 ? 'kill' : 'kills';

      // Get mode from the ID (p2, p10, p9)
      mode = ['Solo', 'Duo', 'Squad'].find(mode =>
        constants[mode.toUpperCase()].id === data.playlist
      );
      table[0].push(mode);
      table[1].push(`${data.matches} ${m}`);
      table[2].push(`${data.top1} ${w}`);
      table[3].push(`${data.kills} ${k}`);

      // Get time difference from match time and now
      date = new Date(data.dateCollected);
      diffSecs = (Date.now() - date.getTime()) / 1000;
      table[4].push(`${formatSeconds(diffSecs, true)} ago`);
    });

    return [res, table];
  },

  // Writes the message for recent stats
  writeRoldMsg: info => {
    console.log(info);
    const matches = info.recentMatches;

    let res = `Recent matches for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;

    let m, w, k, mode, date, diffSecs;
    matches.forEach(data => {
      // Make it plural if not 1
      m = data.matches === 1 ? 'match' : 'matches';
      w = data.top1 === 1 ? 'win' : 'wins';
      k = data.kills === 1 ? 'kill' : 'kills';
    
      mode = ['Solo', 'Duo', 'Squad'].find(mode =>
        constants[mode.toUpperCase()].id === data.playlist
      );
      res += `${mode} - ${data.matches} ${m} - `;

      res += `${data.top1} ${w} - ${data.kills} ${k} -`;
    
      // Get time difference from match time and now
      date = new Date(data.dateCollected);
      diffSecs = (Date.now() - date.getTime()) / 1000;
      res += `${formatSeconds(diffSecs, true)} ago\n`;
    });
    
    return res;
  },

  // Writes the message for season stats
  writeSeasonMsg: (info, { season }) => {
    console.log(info);
    const stats = info.lifeTimeStats;

    let matches, wins, sumPlaces1, sumPlaces2, kills, deaths;
    matches = wins = sumPlaces1 = sumPlaces2 = kills = deaths = 0;
    let modeRes = '';

    ['Solo', 'Duo', 'Squad'].forEach(mode => {
      modeStats = info.stats[constants[`${mode.toUpperCase()}S${season}`].id];
      if (modeStats) {
        // Sums up the values needed to show all season stats
        matches += modeStats.matches.valueInt;
        wins += modeStats.top1.valueInt;
        sumPlaces1 += modeStats.top3.valueInt + modeStats.top5.valueInt
          + modeStats.top10.valueInt;
        sumPlaces2 += modeStats.top6.valueInt + modeStats.top12.valueInt
          + modeStats.top25.valueInt;
        kills += modeStats.kills.valueInt;
        deaths += modeStats.kills.valueInt / modeStats.kd.valueDec;

        // Gets some mode data to display
        modeRes += `\n${mode} matches played: ${modeStats.matches.value}\n`;
        modeRes += `${mode} wins: ${modeStats.top1.value}\n`;
        modeRes += `${mode} kills: ${modeStats.kills.value}\n`;
      }
    });

    let res = `Season ${season} stats for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;
    res += `Matches played: ${matches}\n`;
    res += `Wins: ${wins}\n`;
    res += `Times in top 3/5/10: ${sumPlaces1}\n`;
    res += `Times in top 6/12/25: ${sumPlaces2}\n`;

    let wr = matches === 0 ? 0 : (wins / matches * 100).toFixed(2);
    res += `Win Rate: ${wr}%\n`;

    res += `Kills: ${kills}\n`;

    if (deaths === 0)
      deaths++;
    res += `K/D Ratio: ${(kills / deaths).toFixed(2)}\n`;

    let kg = matches === 0 ? 0 : (kills / matches).toFixed(2);
    res += `Kills/Game: ${kg}\n`;

    return res + modeRes;
  },

  // Writes the message for TRN rating stats
  writeRatingMsg: info => {
    console.log(info);

    let res = `TRN Rating stats for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;

    let formattedMode, rating, modeStats;
    constants.MODES.forEach((mode, index) => {
      if (index >= 3)
        formattedMode = `${mode.substring(9)}S${mode.charAt(7)}`.toUpperCase();
      else
        formattedMode = mode.toUpperCase();
      modeStats = info.stats[constants[formattedMode].id];
      if (modeStats) {
        rating = modeStats.trnRating.displayValue;
        res += `${mode} TRN Rating: ${rating}\n`;
      }
      if ((index + 1) % 3 === 0)
        res += '\n';
    });

    return res;
  },

  // Writes the message for KD stats
  writeKdMsg: info => {
    console.log(info);

    let res = `K/D Ratios for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;

    let formattedMode, kd, modeKd, kills, deaths, modeStats;
    constants.MODES.forEach((mode, index) => {
      // Reset kills and deaths for overall, season 3, and season 4 modes
      if (index % 3 === 0)
        kills = deaths = 0;
      // Get the mode stats
      if (index >= 3)
        formattedMode = `${mode.substring(9)}S${mode.charAt(7)}`.toUpperCase();
      else
        formattedMode = mode.toUpperCase();
      modeStats = info.stats[constants[formattedMode].id];
      if (modeStats) {
        kd = modeStats.kd.displayValue;
        kills += modeStats.kills.valueInt;
        deaths += modeStats.kills.valueInt / modeStats.kd.valueDec;
        // Add mode KD
        res += `${mode} K/D Ratio: ${kd}\n`;
      }
      // Add lifetime or season KD
      if ((index + 1) % 3 === 0) {
        if (index === 2) {
          res += `Lifetime K/D Ratio: ${info.lifeTimeStats[11].value}\n\n`;
        } else {
          if (deaths === 0)
            deaths++;
          res += `${mode.substr(0, 8)} K/D Ratio: ${(kills / deaths).toFixed(2)}\n\n`;
        }
      }
    });

    return res;
  },

  // Writes the message for win rate stats
  writeWinrateMsg: info => {
    console.log(info);

    let res = `Win Rates for ${info.epicUserHandle}:\n`;
    res += `Platform: ${info.platformNameLong}\n\n`;

    let formattedMode, wins, matches, winrate, totalWinrate, modeStats;
    constants.MODES.forEach((mode, index) => {
      // Reset wins and matches for overall, season 3, and season 4 modes
      if (index % 3 === 0)
        wins = matches = 0;
      // Get the mode stats
      if (index >= 3)
        formattedMode = `${mode.substring(9)}S${mode.charAt(7)}`.toUpperCase();
      else
        formattedMode = mode.toUpperCase();
      modeStats = info.stats[constants[formattedMode].id];
      if (modeStats) {
        winrate = modeStats.winRatio.displayValue;
        wins += modeStats.top1.valueInt;
        matches += modeStats.matches.valueInt;
        // Add mode KD
        res += `${mode} Win Rate: ${winrate}%\n`;
      }
      // Add lifetime or season win rate
      if ((index + 1) % 3 === 0) {
        totalWinrate = matches === 0 ? 0 : (wins / matches * 100).toFixed(2);
        if (index === 2)
          res += `Lifetime Win Rate: ${totalWinrate}%\n\n`;
        else
          res += `${mode.substr(0, 8)} Win Rate: ${totalWinrate}%\n\n`;
      }
    });

    return res;
  },

  // Creates a table to compare two players
  writeCompareMsg: (info1, info2) => {
    console.log(info1);
    console.log(info2);

    const stats1 = info1.lifeTimeStats;
    const stats2 = info2.lifeTimeStats;
    const modes1 = info1.stats;
    const modes2 = info2.stats;

    let res = `${info1.epicUserHandle} vs ${info2.epicUserHandle}\n`;
    res += `Platform: ${info1.platformNameLong}\n`;

    const platform1 = info1.platformName;
    const platform2 = info2.platformName;
    const user1 = encodeURIComponent(info1.epicUserHandle);
    const user2 = encodeURIComponent(info2.epicUserHandle);
    res += `${constants.BASE_URL}/${platform1}/${user1}\n`;
    res += `${constants.BASE_URL}/${platform2}/${user2}`;

    let table = [
      [
        'User',
        'Matches played',
        'Wins',
        'Times in top 3/5/10',
        'Times in top 6/12/25',
        'Win Rate',
        'Kills',
        'K/D Ratio',
        'Kills/Game',
        'Score',
        '',
        'Solo matches played',
        'Solo wins',
        'Solo kills',
        '',
        'Duo matches played',
        'Duo wins',
        'Duo kills',
        '',
        'Squad matches played',
        'Squad wins',
        'Squad kills'
      ],
      populateStatsList(stats1, modes1, info1.epicUserHandle),
      populateStatsList(stats2, modes2, info2.epicUserHandle)
    ];

    return [res, table];
  }
};

// Populate list of stats for /compare
function populateStatsList(stats, modes, user) {
  let list = [];
  list.push(user);
  list.push(stats[7].value); // Matches played
  list.push(stats[8].value); // Wins

  const sumPlaces1 = parseInt(stats[0].value) + parseInt(stats[1].value)
    + parseInt(stats[2].value); // Adds up times in top 3, 5, 10
  const sumPlaces2 = parseInt(stats[3].value) + parseInt(stats[4].value)
    + parseInt(stats[5].value); // Adds up times in top 6, 12, 25
  list.push(sumPlaces1); // Top 3/5/10
  list.push(sumPlaces2); // Top 6/12/25

  list.push(stats[9].value); // Win Rate
  list.push(stats[10].value); // Kills
  list.push(stats[11].value); // K/D Ratio

  let kg;
  if (parseInt(stats[7].value) === 0)
    kg = 0;
  else
    kg = (parseInt(stats[10].value) / parseInt(stats[7].value)).toFixed(2);
  list.push(kg); // Kills/Game
  list.push(stats[6].value); // Score

  ['Solo', 'Duo', 'Squad'].forEach(mode => {
    list.push('');
    modeStats = modes[constants[mode.toUpperCase()].id];
    if (modeStats) {
      list.push(modeStats.matches.value);
      list.push(modeStats.top1.value);
      list.push(modeStats.kills.value);
    } else {
      list.push(0, 0, 0);
    }
  });

  return list;
}

// Convert seconds to days, hours, minutes, and seconds
function formatSeconds(seconds, recent) {
  let days = Math.floor(seconds / (60 * 60 * 24)); // days
  seconds -= days * 60 * 60 * 24;
  const hrs = Math.floor(seconds / (60 * 60)); // hours
  seconds -= hrs * 60 * 60;
  const mnts = Math.floor(seconds / 60); // minutes
  seconds -= mnts * 60; // seconds

  let res = '';
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