const TeleBot = require('telebot');
const fortnite = require('fortnite.js');
const Config = require('./config.json');

const bot = new TeleBot(Config.telegramToken);
const client = new fortnite(Config.fortniteKey);

const startMsg = '/user username for information on the player\n'
  + '/pc username for information on the player on PC platform\n'
  + '/xbox username for information on the player on XBOX platform\n'
  + '/ps4 username for information on the player on PS4 platform\n'  
  + '/solo username for player\'s lifetime solo stats\n'
  + '/duo username for player\'s lifetime duo stats\n'
  + '/squad username for player\'s lifetime squad stats\n'
  + '/solos3 username for player\'s season 3 solo stats\n'
  + '/duos3 username for player\'s season 3 duo stats\n'
  + '/squads3 username for player\'s season 3 squad stats\n'
  + '/recent username for player\'s recent match information';

bot.on('/start', msg => {
  msg.reply.text(startMsg);
});

// Get global stats on a user
bot.on(/^\/user (.+)$/, (msg, props) => {
  var user = props.match[1]; // Username
  formatGlobal(user, fortnite.PC) // Tries to find user on PC
    .then(res => msg.reply.text(res, { asReply: true }))
    .catch(err => {
      formatGlobal(user, fortnite.XBOX) // Tries xbox if PC not found
        .then(resp => msg.reply.text(resp, { asReply: true }))
        .catch(error => {
          formatGlobal(user, fortnite.PS4) // Tries ps4 if xbox not found
            .then(response => msg.reply.text(response, {asReply: true}))
            .catch(e => msg.reply.text(e, { asReply: true }));
        });
    });
});

// Get global stats on a user specifying platform
bot.on(/^\/(pc|xbox|ps4) (.+)$/, (msg, props) => {
  var user = props.match[2]; // Username
  // Map command names to the platform specifier in the API
  var platforms = { 'pc': 'pc', 'xbox': 'xbl', 'ps4': 'psn' };
  formatGlobal(user, platforms[1])
    .then(res => msg.reply.text(res, { asReply: true }))
    .catch(err => msg.reply.text(err, { asReply: true }));
});

// Format global stats for Telegram message
function formatGlobal(user, platform) {
  return new Promise((resolve, reject) => {
    client.get(user, platform, true)
      .then(info => {
        console.log(info);
        stats = info.lifeTimeStats;

        var res = `Lifetime stats for ${info.epicUserHandle}:\n`;
        res += `Platform: ${info.platformNameLong}\n\n`;
        res += `Matches played: ${stats[7].value}\n`;
        res += `Time played: ${stats[13].value}\n`;
        res += `Avg Survival Time: ${stats[14].value}\n`;
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
        res += `Kills/Minute: ${stats[12].value}\n`;

        // Shows some limited data for the game modes
        var modes = { 'Solo': 'p2', 'Duo': 'p10', 'Squad': 'p9' };
        for (var mode in modes) {
          modeStats = info.stats[modes[mode]]
          if (modeStats !== undefined) {
            res += `\n${mode} matches played: ${modeStats.matches.value}\n`;
            var avgSeconds = parseFloat(modeStats.avgTimePlayed.value);
            // Gets time played by doing average time played * number of matches
            var seconds = modeStats.matches.valueInt * avgSeconds;
            res += `${mode} time played:${formatSeconds(seconds, false)}\n`;
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

// Get solo, duo, or squad stats for lifetime or season 3
bot.on(/^\/(solo|duo|squad|solos3|duos3|squads3) (.+)$/, (msg, props) => {
  // Regex matches all 6 commands because method works the same way for each
  var mode = props.match[1]; // Mode
  mode = mode[0].toUpperCase() + mode.substr(1); // Capitalize first letter
  var user = props.match[2]; // Username

  // Each mode has the data for top x wins differently
  // Solo stores times in top 10 and 25, duo top 5 and 12, squads top 3 and 6
  var modes = {
    'Solo': [10, 25],
    'Duo': [5, 12],
    'Squad': [3, 6],
    'Solos3': [10, 25],
    'Duos3': [5, 12],
    'Squads3': [3, 6]
  };
  // Checks if command is for season 3 because formatting is slightly different
  var currSeason = mode.endsWith('s3') ? true : false;
  formatModes(user, mode, modes[mode], fortnite.PC, currSeason)
    .then(res => msg.reply.text(res, { asReply: true }))
    .catch(err => {
      formatModes(user, mode, modes[mode], fortnite.XBOX, currSeason)
        .then(resp => msg.reply.text(resp, { asReply: true }))
        .catch(error => {
          formatModes(user, mode, modes[mode], fortnite.PS4, currSeason)
            .then(response => msg.reply.text(response, { asReply: true }))
            .catch(e => msg.reply.text(e, { asReply: true }));
        });
    });
});

// Format solo/duo/squad lifetime/season3 stats for Telegram message
function formatModes(user, mode, nums, platform, currSeason) {
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
        if (!currSeason) {
          var avgSeconds = parseFloat(stats.avgTimePlayed.value);
          var seconds = stats.matches.valueInt * avgSeconds;
          res += `Time played:${formatSeconds(seconds, false)}\n`;
          res += `Avg Survival Time: ${stats.avgTimePlayed.displayValue}\n`;
        }

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
        res += `K/D Ratio: ${stats.kd.value}\n`;
        res += `Kills/Game: ${stats.kpg.value}\n`;

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

// Get recent matches on a user
bot.on(/^\/recent (.+)$/, (msg, props) => {
  var user = props.match[1]; // Username
  formatRecent(user, fortnite.PC)
    .then(res => msg.reply.text(res, { asReply: true }))
    .catch(err => {
      formatRecent(user, fortnite.XBOX)
        .then(resp => msg.reply.text(resp, { asReply: true }))
        .catch(error => {
          formatRecent(user, fortnite.PS4)
            .then(response => msg.reply.text(response, { asReply: true }))
            .catch(e => msg.reply.text(e, { asReply: true }));
        });
    });
});

// Format recent matches stats for Telegram message
function formatRecent(user, platform) {
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

// Convert seconds to days, hours, minutes, and seconds
function formatSeconds(seconds, recent) {
  var days = Math.floor(seconds / (60 * 60 * 24)); // days
  seconds -= days * 60 * 60 * 24;
  var hrs = Math.floor(seconds / (60 * 60)); // hours
  seconds -= hrs * 60 * 60;
  var mnts = Math.floor(seconds / 60); // minutes
  seconds -= mnts * 60; // seconds

  var res = '';
  if (recent || days > 0) // Always shows days for current season, else if > 0
    res += (' ' + days + 'd');
  // Only shows hours and minutes if not for current season
  if (!recent && (hrs > 0 || days > 0)) // Shows hours if exists or days exists
    res += (' ' + hrs + 'h');
  if (!recent && (mnts > 0 || hrs > 0)) // Shows min if exists or hours exists
    res += (' ' + mnts + 'm');
  return res;
}

bot.start();