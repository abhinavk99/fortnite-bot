const TeleBot = require('telebot');
const Eris = require('eris');
const Config = require('./config.json');
const fortnite = require('fortnite.js');
const fortniteData = require('./fortniteData');

const teleBot = new TeleBot(Config.telegramToken); // Telegram bot
const discBot = new Eris(Config.discordToken); // Discord bot

const formatGlobal = fortniteData.formatGlobal;
const formatModes = fortniteData.formatModes;
const formatRecent = fortniteData.formatRecent;
const formatSeconds = fortniteData.formatSeconds;

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

teleBot.on(/^\/start$/i, msg => {
  msg.reply.text(startMsg);
});

// Get global stats on a user - Telegram
teleBot.on(/^\/user (.+)$/i, (msg, props) => {
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

// Get global stats on a user specifying platform - Telegram
teleBot.on(/^\/(pc|xbox|ps4) (.+)$/i, (msg, props) => {
  var user = props.match[2]; // Username
  var platform = props.match[1].toLowerCase(); // Platform
  // Map command names to the platform specifier in the API
  var platforms = { 'pc': 'pc', 'xbox': 'xbl', 'ps4': 'psn' };
  formatGlobal(user, platforms[platform])
    .then(res => msg.reply.text(res, { asReply: true }))
    .catch(err => msg.reply.text(err, { asReply: true }));
});

// Get solo, duo, or squad stats for lifetime or season 3 - Telegram
teleBot.on(/^\/(solo|duo|squad|solos3|duos3|squads3) (.+)$/i, (msg, props) => {
  // Regex matches all 6 commands because method works the same way for each
  var mode = props.match[1]; // Mode
  // Only capitalize first letter
  mode = mode[0].toUpperCase() + mode.substr(1).toLowerCase();
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

// Get recent matches on a user - Telegram
teleBot.on(/^\/recent (.+)$/i, (msg, props) => {
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

// Discord bot
discBot.on('messageCreate', msg => {
  var text = msg.content.toLowerCase();
  var name = `<@${msg.author.id}>`; // Username to mention Discord user with
  if (text === '/info') {
    discBot.createMessage(msg.channel.id, startMsg);
  } else if (text.startsWith('/user')) {
    // Get global stats on a user - Discord
    var user = text.substring(6);
    formatGlobal(user, fortnite.PC) // Tries to find user on PC
      .then(res => discBot.createMessage(msg.channel.id, `${name}\n\n${res}`))
      .catch(err => {
        formatGlobal(user, fortnite.XBOX) // Tries xbox if PC not found
          .then(resp => discBot.createMessage(msg.channel.id,
            `${name}\n\n${resp}`))
          .catch(error => {
            formatGlobal(user, fortnite.PS4) // Tries ps4 if xbox not found
              .then(response => discBot.createMessage(msg.channel.id,
                `${name}\n\n${response}`))
              .catch(e => discBot.createMessage(msg.channel.id,
                `${name}\n\n${e}`));
          });
      });
  } else if (text.match(/^\/(pc|xbox|ps4) (.+)$/i)) {
    // Get global stats on a user specifying platform - Discord
    var arr = text.split(' ');
    var user = arr[1]; // Username
    var platform = arr[0].substring(1); // Platform
    // Map command names to the platform specifier in the API
    var platforms = { 'pc': 'pc', 'xbox': 'xbl', 'ps4': 'psn' };
    formatGlobal(user, platforms[platform])
      .then(res => discBot.createMessage(msg.channel.id, `${name}\n\n${res}`))
      .catch(err => discBot.createMessage(msg.channel.id, `${name}\n\n${e}`));
  }
});

teleBot.start();
discBot.connect();