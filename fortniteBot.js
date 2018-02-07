const Config = require('./config.json');
const TeleBot = require('telebot');
const fortnite = require('fortnite.js');

const bot = new TeleBot(Config.telegramToken);
const client = new fortnite(Config.fortniteKey);

const startMsg = '/user username for information on the player\n'
  + '/solo username for player\'s solo stats\n'
  + '/duo username for player\'s duo stats\n'
  + '/squad username for player\'s squad stats\n';

bot.on('/start', (msg) => {
  msg.reply.text(startMsg);
});

bot.on(/^\/user (.+)$/, (msg, props) => {
  var user = props.match[1];
  client.get(user, fortnite.PC)
    .then((info) => {
      console.log(info);
      
      var res = `Lifetime stats for ${info.displayName}:\n\n`;
      res += `Matches played: ${info.stats.matches}\n`;
      res += `Time played: ${info.stats.timePlayed}\n`;
      res += `Avg Survival Time: ${info.stats.avgTimePlayed}\n`;
      res += `Wins: ${info.stats.top1}\n`;
      res += `Times in top 3: ${info.stats.top3}\n`;
      res += `Win Rate: ${info.stats.winPercent}\n`;
      res += `Kills: ${info.stats.kills}\n`;
      res += `K/D Ratio: ${info.stats.kd}\n`;
      res += `Kills/Minute: ${info.stats.kpm}\n`;

      var modes = ['Solo', 'Duo', 'Squad'];
      modes.forEach((mode) => {
        if (info[mode.toLowerCase()].matches !== undefined
            && info[mode.toLowerCase()].minutesPlayed !== undefined) {
          res += `\n${mode} matches played: ${info[mode.toLowerCase()].matches.value}\n`;
          res += `${mode} time played: ${info[mode.toLowerCase()].minutesPlayed.displayValue}\n`;
        }
      });

      return msg.reply.text(res, {asReply: true});
    }).catch((err) => {
      console.log(err);
      return msg.reply.text('User not found.', {asReply: true});
    });
});

bot.on(/^\/solo (.+)$/, (msg, props) => {
  var user = props.match[1];
  formatInfo(user, 'Solo')
    .then(res => msg.reply.text(res, {asReply: true}))
    .catch(err => msg.reply.text(err, {asReply: true}));
});

bot.on(/^\/duo (.+)$/, (msg, props) => {
  var user = props.match[1];
  formatInfo(user, 'Duo')
    .then(res => msg.reply.text(res, {asReply: true}))
    .catch(err => msg.reply.text(err, {asReply: true}));
});

bot.on(/^\/squad (.+)$/, (msg, props) => {
  var user = props.match[1];
  formatInfo(user, 'Squad')
    .then(res => msg.reply.text(res, {asReply: true}))
    .catch(err => msg.reply.text(err, {asReply: true}));
});

function formatInfo(user, mode) {
  return new Promise((resolve, reject) => {
    client.get(user, fortnite.PC)
      .then((info) => {
        if (info[mode.toLowerCase()].matches === undefined)
          return reject('User has never played ' + mode + '.');

        console.log(info[mode.toLowerCase()]);
        
        var res = `${mode} stats for ${info.displayName}:\n\n`;
        mode = mode.toLowerCase();

        res += `Matches played: ${info[mode].matches.value}\n`;
        res += `Time played: ${info[mode].minutesPlayed.displayValue}\n`;
        res += `Avg Survival Time: ${info[mode].avgTimePlayed.displayValue}\n`;
        res += `Wins: ${info[mode].top1.value}\n`;
        res += `Times in top 3: ${info[mode].top3.value}\n`;
        if (info[mode].winRatio !== undefined)
          res += `Win Rate: ${info[mode].winRatio.displayValue}%\n`;
        else
          res += `Win Rate: 0%\n`;
        res += `Kills: ${info[mode].kills.value}\n`;
        res += `K/D Ratio: ${info[mode].kd.value}\n`;
        res += `Kills/Minute: ${info[mode].kpm.value}\n`;
        res += `Kills/Game: ${info[mode].kpg.value}\n`;

        return resolve(res);
      }).catch((err) => {
        console.log(err);
        if (err === 'HTTP Player Not Found')
          return reject('User not found.');
        else
          return reject('Error found when getting user info.')
      });
  });
}

bot.start();