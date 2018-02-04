const Config = require('./config.json');
const TeleBot = require('telebot');
const fetch = require('node-fetch');

const bot = new TeleBot(Config.telegramToken);

bot.on(/^\/info (.+)$/, (msg, props) => {
  var user = props.match[1];
  fetch(`https://api.fortnitetracker.com/v1/profile/pc/${user}`, {
    method: 'GET',
    headers: {
      'TRN-Api-Key': Config.fortniteKey
    }
  }).then((res) => {
    return res.json();
  }).then((info) => {
    console.log(info);
  }).catch((err) => {
    console.log(err);
  });
});

bot.start();