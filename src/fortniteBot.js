require('dotenv').config()

const fortnite = require('fortnite.js');

const TeleBot = require('telebot');
const Eris = require('eris');
const teleBot = new TeleBot(process.env.TELEGRAM_TOKEN); // Telegram bot
const discBot = new Eris(process.env.DISCORD_TOKEN); // Discord bot

// Methods for actually getting Fortnite data are in fortniteData.js
const fortniteData = require('./fortniteData');
const getGlobalData = fortniteData.getGlobalData;
const getModesData = fortniteData.getModesData;
const getRecentData = fortniteData.getRecentData;
const getSeasonData = fortniteData.getSeasonData;

const constants = require('./constants');

// Telegram start message
teleBot.on(/^\/start$/i, msg => {
  sendMessage(msg, startMsg);
});

// Telegram bot responding to messages
teleBot.on(['text', 'forward'], msg => {
  var text = msg.text.toLowerCase();
  parseCommand(text, msg);
});

// Discord bot sets game to /info when it's ready
discBot.on('ready', () => {
  console.log('Fortnite Bot is ready!');
  discBot.editStatus('online', { name: '/info' });
});

// Discord bot responding to messages
discBot.on('messageCreate', msg => {
  var text = msg.content.toLowerCase();
  parseCommand(text, msg, false);
});

// Calls the right method based on the command
function parseCommand(text, msg, isTelegram = true) {
  if (text === '/info') {
    sendMessage(msg, startMsg, isTelegram);
  } else if (text.startsWith('/user ')) {
    // Get global stats on a user
    var user = text.substring(6);
    sendGlobalCalls(user, msg, isTelegram);
  } else if (text.match(/^\/(pc|xbox|ps4) (.+)$/i)) {
    // Get global stats on a user specifying platform
    var arr = text.split(' ');
    var user = arr.slice(1).join(' '); // Username
    var platform = arr[0].substring(1); // Platform
    sendPlatformsCalls(user, platform, msg, isTelegram);
  } else if (text.match(/^\/(solo|duo|squad)(s3|s4)? (.+)$/i)) {
    // Get solo, duo, or squad stats for lifetime or season
    var arr = text.split(' ');
    var mode = arr[0].substring(1); // Mode
    // Only capitalize first letter
    mode = mode[0].toUpperCase() + mode.substr(1).toLowerCase();
    var user = arr.slice(1).join(' '); // Username
    sendModesCalls(user, mode, msg, isTelegram);
  } else if (text.startsWith('/recent ')) {
    // Get recent matches on a user
    var user = text.substring(8); // Username
    sendRecentCalls(user, msg, isTelegram);
  } else if (text.match(/^\/(season|s)(3|4) (.+)$/i)) {
    // Get all season stats on a user
    var arr = text.split(' ');
    var season = arr[0].substr(-1);
    var user = arr.slice(1).join(' '); // Username
    sendSeasonCalls(user, season, msg, isTelegram);
  }
}

// Sends message a different way based on whether it's for Discord or Telegram
function sendMessage(msg, content, isTelegram = true) {
  if (isTelegram) {
    return msg.reply.text(content, { asReply: true })
  } else {
    return discBot.createMessage(msg.channel.id, {
      embed: {
        color: constants.DISCORD_COLOR,
        author: {
          name: discBot.user.username,
          icon_url: discBot.user.avatarURL
        },
        title: 'Fortnite Statistics',
        description: `<@${msg.author.id}>\n\n${content}`,
        timestamp: new Date()
      }
    });
  }
}

// Gets the Fortnite data for global (checks all platforms)
function sendGlobalCalls(user, msg, isTelegram = true) {
  getGlobalData(user, constants.PC) // Tries to find user on PC
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      getGlobalData(user, constants.XBOX) // Tries xbox if PC not found
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          getGlobalData(user, constants.PS4) // Tries ps4 if xbox not found
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

// Gets the Fortnite data for platforms
function sendPlatformsCalls(user, platform, msg, isTelegram = true) {
  getGlobalData(user, constants[platform.toUpperCase()])
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => sendMessage(msg, err, isTelegram));
}

// Gets the Fortnite data for modes (checks all platforms)
function sendModesCalls(user, mode, msg, isTelegram = true) {
  // Checks if command is for season 3 because formatting is slightly different
  var season;
  var formattedMode;
  if (mode.endsWith('s3') || mode.endsWith('s4')) {
    season = mode.substr(-1);
    formattedMode = `${mode.substring(0, mode.length - 2)}_S`.toUpperCase();
  } else {
    season = '';
    formattedMode = mode.toUpperCase();
  }
  var top = constants[formattedMode].top;
  getModesData(user, mode, top, constants.PC, season)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      getModesData(user, mode, top, constants.XBOX, season)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          getModesData(user, mode, top, constants.PS4, season)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

// Gets the Fortnite data for recent (checks all platforms)
function sendRecentCalls(user, msg, isTelegram = true) {
  getRecentData(user, constants.PC)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      getRecentData(user, constants.XBOX)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          getRecentData(user, constants.PS4)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

// Gets the Fortnite data for Season (checks all platforms)
function sendSeasonCalls(user, season, msg, isTelegram = true) {
  getSeasonData(user, season, constants.PC)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      getSeasonData(user, season, constants.XBOX)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          getSeasonData(user, season, constants.PS4)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

teleBot.start();
discBot.connect();