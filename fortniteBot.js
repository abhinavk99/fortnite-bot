const Config = require('./config.json');
const TeleBot = require('telebot');
const fortnite = require('fortnite.js');

const bot = new TeleBot(Config.telegramToken);
const client = new fortnite(Config.fortniteKey);

bot.on('/start', (msg) => {
  msg.reply.text('/user <username> for information on the player\n');
});

bot.on(/^\/user (.+)$/, (msg, props) => {
  var user = props.match[1];
  client.get(user, fortnite.PC)
    .then((info) => {
      console.log(info);
      
      var res = `User: ${info.displayName}\n`;
      res += `Matches played: ${info.stats.matches}\n`;
      res += `Time played: ${info.stats.timePlayed}\n`;
      res += `Wins: ${info.stats.top1}\n`;
      var winRate = parseFloat(info.stats.top1) / parseFloat(info.stats.matches);
      winRate = winRate.toFixed(5);
      res += `Win Rate: ${winRate}\n`;
      res += `Kills: ${info.stats.kills}\n`;
      res += `K/D Ratio: ${info.stats.kd}\n`;
      res += `Kills/Min: ${info.stats.kpm}\n`;

      return msg.reply.text(res, {asReply: true});
    }).catch((err) => {
      console.log(err);
      return msg.reply.text('User not found.', {asReply: true});
    });
});

bot.start();