const Config = require('./config.json');
const TeleBot = require('telebot');
const fetch = require('node-fetch');

const bot = new TeleBot(Config.telegramToken);

bot.on('/start', (msg) => {
  msg.reply.text('/user <username> for information on the player\n');
});

bot.on(/^\/user (.+)$/, (msg, props) => {
  var user = props.match[1];
  _getUserInfo(user)
  .then((info) => {
    console.log(info);
    if (info.error === 'Player Not Found') {
      return msg.reply.text('User not found.', {asReply: true});
    } else {
      var res = `User: ${info.epicUserHandle}\n`;
      res += `Matches played: ${info.lifeTimeStats[7].value}\n`;
      res += `Time played: ${info.lifeTimeStats[13].value}\n`;
      res += `Wins: ${info.lifeTimeStats[8].value}\n`;
      res += `Kills: ${info.lifeTimeStats[10].value}\n`;
      res += `K/D Ratio: ${info.lifeTimeStats[11].value}\n`;
      res += `Kills/Min: ${info.lifeTimeStats[12].value}\n`;
      return msg.reply.text(res, {asReply: true});
    }
  }).catch(console.error);
});

bot.start();

function _getUserInfo(user) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.fortnitetracker.com/v1/profile/pc/${encodeURI(user)}`, {
      method: 'GET',
      headers: {
        'TRN-Api-Key': Config.fortniteKey
      }
    }).then(res => res.json())
    .then(info => resolve(info))
    .catch(err => reject(err));
  });
}