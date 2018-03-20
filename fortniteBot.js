const Config = require('./config.json');
const TeleBot = require('telebot');
const fortnite = require('fortnite.js');

const bot = new TeleBot(Config.telegramToken);
const client = new fortnite(Config.fortniteKey);

const startMsg = '/user username for information on the player\n'
  + '/solo username for player\'s solo stats\n'
  + '/duo username for player\'s duo stats\n'
  + '/squad username for player\'s squad stats\n';

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

        var modes = {'Solo': 'p2', 'Duo': 'p10', 'Squad': 'p9'};
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

// Get solo stats on a user
bot.on(/^\/solo (.+)$/, (msg, props) => {
  var user = props.match[1];
  formatInfo(user, 'Solo', [10, 25], fortnite.PC)
    .then(res => msg.reply.text(res, {asReply: true}))
    .catch(err => {
      formatInfo(user, 'Solo', [10, 25], fortnite.XBOX)
        .then(resp => msg.reply.text(resp, {asReply: true}))
        .catch(error => {
          formatInfo(user, 'Solo', [10, 25], fortnite.PS4)
            .then(response => msg.reply.text(response, { asReply: true }))
            .catch(e => msg.reply.text(e, {asReply: true}));
        });
    });
});

// Get duo stats on a user
bot.on(/^\/duo (.+)$/, (msg, props) => {
  var user = props.match[1];
  formatInfo(user, 'Duo', [5, 12], fortnite.PC)
    .then(res => msg.reply.text(res, { asReply: true }))
    .catch(err => {
      formatInfo(user, 'Duo', [5, 12], fortnite.XBOX)
        .then(resp => msg.reply.text(resp, { asReply: true }))
        .catch(error => {
          formatInfo(user, 'Duo', [5, 12], fortnite.PS4)
            .then(response => msg.reply.text(response, { asReply: true }))
            .catch(e => msg.reply.text(e, { asReply: true }));
        });
    });
});

// Get squad stats on a user
bot.on(/^\/squad (.+)$/, (msg, props) => {
  var user = props.match[1];
  formatInfo(user, 'Squad', [3, 6], fortnite.PC)
    .then(res => msg.reply.text(res, { asReply: true }))
    .catch(err => {
      formatInfo(user, 'Squad', [3, 6], fortnite.XBOX)
        .then(resp => msg.reply.text(resp, { asReply: true }))
        .catch(error => {
          formatInfo(user, 'Squad', [3, 6], fortnite.PS4)
            .then(response => msg.reply.text(response, { asReply: true }))
            .catch(e => msg.reply.text(e, { asReply: true }));
        });
    });
});

function formatInfo(user, mode, nums, platform) {
  return new Promise((resolve, reject) => {
    client.get(user, platform)
      .then(info => {
        if (!info[mode.toLowerCase()].matches)
          return resolve('User has never played ' + mode + '.');

        console.log(info[mode.toLowerCase()]);
        
        var res = `${mode} stats for ${info.displayName}:\n`;
        mode = mode.toLowerCase();

        res += `Platform: ${platform.toUpperCase()}\n\n`;
        res += `Matches played: ${info[mode].matches.value}\n`;

        var avgSeconds = parseFloat(info[mode].avgTimePlayed.value);
        var seconds = info[mode].matches.valueInt * avgSeconds;
        res += `Time played:${formatSeconds(seconds)}\n`;

        res += `Avg Survival Time: ${info[mode].avgTimePlayed.displayValue}\n`;
        res += `Wins: ${info[mode].top1.value}\n`;

        nums.forEach(num => {
          res += `Times in top ${num}: ${info[mode][`top${num}`].value}\n`;
        });

        if (info[mode].winRatio !== undefined)
          res += `Win Rate: ${info[mode].winRatio.displayValue}%\n`;
        else
          res += `Win Rate: 0%\n`;
          
        res += `Kills: ${info[mode].kills.value}\n`;
        res += `K/D Ratio: ${info[mode].kd.value}\n`;
        res += `Kills/Game: ${info[mode].kpg.value}\n`;

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