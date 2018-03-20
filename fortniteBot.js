const Config = require('./config.json');
const TeleBot = require('telebot');
const fortnite = require('fortnite.js');

const bot = new TeleBot(Config.telegramToken);
const client = new fortnite(Config.fortniteKey);

const startMsg = '/user username for information on the player\n'
  + '/solo username for player\'s lifetime solo stats\n'
  + '/duo username for player\'s lifetime duo stats\n'
  + '/squad username for player\'s lifetime squad stats\n'
  + '/solos3 username for player\'s season 3 solo stats\n'
  + '/duos3 username for player\'s season 3 duo stats\n'
  + '/squads3 username for player\'s season 3 squad stats\n';

bot.on('/start', msg => {
  msg.reply.text(startMsg);
});

// Get global stats on a user
bot.on(/^\/user (.+)$/, (msg, props) => {
  var user = props.match[1];
  formatGlobal(user, fortnite.PC)
    .then(res => msg.reply.text(res, {asReply: true}))
    .catch(err => {
      formatGlobal(user, fortnite.XBOX)
        .then(resp => msg.reply.text(resp, {asReply: true}))
        .catch(error => {
          formatGlobal(user, fortnite.PS4)
            .then(response => msg.reply.text(response, {asReply: true}))
            .catch(e => msg.reply.text(e, {asReply: true}));
        });
    });
});

// Format global stats for Telegram message
function formatGlobal(user, platform) {
  return new Promise((resolve, reject) => {
    client.get(user, platform, true)
      .then((info) => {
        console.log(info);
        stats = info.lifeTimeStats;

        var res = `Lifetime stats for ${info.epicUserHandle}:\n`;
        res += `Platform: ${info.platformNameLong}\n\n`;
        res += `Matches played: ${stats[7].value}\n`;
        res += `Time played: ${stats[13].value}\n`;
        res += `Avg Survival Time: ${stats[14].value}\n`;
        res += `Wins: ${stats[8].value}\n`;

        var sumPlaces1 = parseInt(stats[0].value) + parseInt(stats[1].value)
          + parseInt(stats[2].value);
        var sumPlaces2 = parseInt(stats[3].value) + parseInt(stats[4].value)
          + parseInt(stats[5].value);
        res += `Times in top 3/5/10: ${sumPlaces1}\n`;
        res += `Times in top 6/12/25: ${sumPlaces2}\n`;

        res += `Win Rate: ${stats[9].value}\n`;
        res += `Kills: ${stats[10].value}\n`;
        res += `K/D Ratio: ${stats[11].value}\n`;
        res += `Kills/Minute: ${stats[12].value}\n`;

        var modes = { 'Solo': 'p2', 'Duo': 'p10', 'Squad': 'p9' };
        for (var mode in modes) {
          modeStats = info.stats[modes[mode]]
          if (modeStats.matches !== undefined) {
            res += `\n${mode} matches played: ${modeStats.matches.value}\n`;
            var avgSeconds = parseFloat(modeStats.avgTimePlayed.value);
            var seconds = modeStats.matches.valueInt * avgSeconds;
            res += `${mode} time played:${formatSeconds(seconds)}\n`;
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
  var mode = props.match[1];
  mode = mode[0].toUpperCase() + mode.substr(1);
  var user = props.match[2];

  var modes = {
    'Solo': [10, 25],
    'Duo': [5, 12],
    'Squad': [3, 6],
    'Solos3': [10, 25],
    'Duos3': [5, 12],
    'Squads3': [3,6]
  };
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
        var modes = {
          'Solo': 'p2',
          'Duo': 'p10',
          'Squad': 'p9',
          'Solos3': 'curr_p2',
          'Duos3': 'curr_p10',
          'Squads3': 'curr_p9'
        };
        var stats = info.stats[modes[mode]];
        if (!stats.matches)
          return resolve('User has never played ' + mode + '.');
        console.log(stats);
        
        var res = currSeason ? 'Season 3 ' : '';
        res += `${mode.slice(0, -2)} stats for ${info.epicUserHandle}:\n`;

        res += `Platform: ${info.platformNameLong}\n\n`;
        res += `Matches played: ${stats.matches.value}\n`;

        var avgSeconds = parseFloat(stats.avgTimePlayed.value);
        var seconds = stats.matches.valueInt * avgSeconds;
        res += `Time played:${formatSeconds(seconds)}\n`;

        res += `Avg Survival Time: ${stats.avgTimePlayed.displayValue}\n`;
        res += `Wins: ${stats.top1.value}\n`;

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

// Convert seconds to days, hours, minutes, and seconds
function formatSeconds(seconds) {
  var days = Math.floor(seconds / (60 * 60 * 24));
  seconds -= days * 60 * 60 * 24;
  var hrs = Math.floor(seconds / (60 * 60));
  seconds -= hrs * 60 * 60;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  var res = '';
  if (days > 0)
    res += (' ' + days + 'd');
  if (hrs > 0 || days > 0)
    res += (' ' + hrs + 'h');
  if (mnts > 0 || hrs > 0)
    res += (' ' + mnts + 'm');
  return res;
}

bot.start();