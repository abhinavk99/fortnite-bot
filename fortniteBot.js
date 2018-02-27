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
    client.get(user, platform)
      .then((info) => {
        console.log(info);

        var res = `Lifetime stats for ${info.displayName}:\n`;
        res += `Platform: ${platform.toUpperCase()}\n\n`;
        res += `Matches played: ${info.stats.matches}\n`;
        res += `Time played: ${info.stats.timePlayed}\n`;
        res += `Avg Survival Time: ${info.stats.avgTimePlayed}\n`;
        res += `Wins: ${info.stats.top1}\n`;

        sumPlaces = parseInt(info.stats.top3) + parseInt(info.stats.top5)
          + parseInt(info.stats.top6) + parseInt(info.stats.top12);
        res += `Times in top 3/5/6/12: ${sumPlaces}\n`;

        res += `Win Rate: ${info.stats.winPercent}\n`;
        res += `Kills: ${info.stats.kills}\n`;
        res += `K/D Ratio: ${info.stats.kd}\n`;
        res += `Kills/Minute: ${info.stats.kpm}\n`;

        var modes = ['Solo', 'Duo', 'Squad'];
        modes.forEach(mode => {
          if (info[mode.toLowerCase()].matches !== undefined
            && info[mode.toLowerCase()].minutesPlayed !== undefined) {
            res += `\n${mode} matches played: ${info[mode.toLowerCase()].matches.value}\n`;
            res += `${mode} time played: ${info[mode.toLowerCase()].minutesPlayed.displayValue}\n`;
          }
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
        if (info[mode.toLowerCase()].matches === undefined)
          return reject('User has never played ' + mode + '.');

        console.log(info[mode.toLowerCase()]);
        
        var res = `${mode} stats for ${info.displayName}:\n`;
        mode = mode.toLowerCase();

        res += `Platform: ${platform.toUpperCase()}\n\n`;
        res += `Matches played: ${info[mode].matches.value}\n`;
        res += `Time played: ${info[mode].minutesPlayed.displayValue}\n`;
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
        res += `Kills/Minute: ${info[mode].kpm.value}\n`;
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

bot.start();