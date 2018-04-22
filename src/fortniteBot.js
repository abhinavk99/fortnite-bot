require('dotenv').config()
const TeleBot = require('telebot');
const Eris = require('eris');
const fortnite = require('fortnite.js');
const fortniteData = require('./fortniteData');

const teleBot = new TeleBot(process.env.TELEGRAM_TOKEN); // Telegram bot
const discBot = new Eris(process.env.DISCORD_TOKEN); // Discord bot

// Methods for actually getting Fortnite data are in fortniteData.js
const formatGlobal = fortniteData.formatGlobal;
const formatModes = fortniteData.formatModes;
const formatRecent = fortniteData.formatRecent;
const formatSeconds = fortniteData.formatSeconds;
const formatSeason = fortniteData.formatSeason;

// Map command names to the platform specifier in the API
const platforms = { 'pc': 'pc', 'xbox': 'xbl', 'ps4': 'psn' };
// Each mode has the data for top x wins differently
// Solo stores times in top 10 and 25, duo top 5 and 12, squads top 3 and 6
const modes = {
  'Solo': [10, 25],
  'Duo': [5, 12],
  'Squad': [3, 6],
  'Solos3': [10, 25],
  'Duos3': [5, 12],
  'Squads3': [3, 6]
};

const startMsg = '/user username for information on the player\n'
  + '/pc username for information on the player on PC platform\n'
  + '/xbox username for information on the player on XBOX platform\n'
  + '/ps4 username for information on the player on PS4 platform\n'
  + '/season3 username for all season 3 information on the player\n'
  + '/solo username for player\'s lifetime solo stats\n'
  + '/duo username for player\'s lifetime duo stats\n'
  + '/squad username for player\'s lifetime squad stats\n'
  + '/solos3 username for player\'s season 3 solo stats\n'
  + '/duos3 username for player\'s season 3 duo stats\n'
  + '/squads3 username for player\'s season 3 squad stats\n'
  + '/recent username for player\'s recent match information';

teleBot.on(/^\/start$/i, msg => {
  sendMessage(msg, startMsg);
});

// Get global stats on a user - Telegram
teleBot.on(/^\/user (.+)$/i, (msg, props) => {
  var user = props.match[1]; // Username
  sendGlobalCalls(user, msg);
});

// Get global stats on a user specifying platform - Telegram
teleBot.on(/^\/(pc|xbox|ps4) (.+)$/i, (msg, props) => {
  var user = props.match[2]; // Username
  var platform = props.match[1].toLowerCase(); // Platform
  sendPlatformsCalls(user, platform, msg);
});

// Get solo, duo, or squad stats for lifetime or season 3 - Telegram
teleBot.on(/^\/(solo|duo|squad|solos3|duos3|squads3) (.+)$/i, (msg, props) => {
  // Regex matches all 6 commands because method works the same way for each
  var mode = props.match[1]; // Mode
  // Only capitalize first letter
  mode = mode[0].toUpperCase() + mode.substr(1).toLowerCase();
  var user = props.match[2]; // Username
  sendModesCalls(user, mode, msg);
});

// Get recent matches on a user - Telegram
teleBot.on(/^\/recent (.+)$/i, (msg, props) => {
  var user = props.match[1]; // Username
  sendRecentCalls(user, msg);
});

// Get all season 3 stats on a user
teleBot.on(/^\/season3 (.+)$/i, (msg, props) => {
  var user = props.match[1]; // Username
  sendSeasonCalls(user, msg);
});

// Discord bot sets game to /info when it's ready
discBot.on('ready', () => {
  console.log('Fortnite Bot is ready!');
  discBot.editStatus('online', { name: '/info' });
});

// Discord bot responding to messages
discBot.on('messageCreate', msg => {
  var text = msg.content.toLowerCase();
  if (text === '/info') {
    sendMessage(msg, startMsg, false);
  } else if (text.startsWith('/user ')) {
    // Get global stats on a user - Discord
    var user = text.substring(6);
    sendGlobalCalls(user, msg, false);
  } else if (text.match(/^\/(pc|xbox|ps4) (.+)$/i)) {
    // Get global stats on a user specifying platform - Discord
    var arr = text.split(' ');
    var user = arr[1]; // Username
    var platform = arr[0].substring(1); // Platform
    sendPlatformsCalls(user, platform, msg, false);
  } else if (text.match(/^\/(solo|duo|squad|solos3|duos3|squads3) (.+)$/i)) {
    // Get solo, duo, or squad stats for lifetime or season 3 - Discord
    var arr = text.split(' ');
    var mode = arr[0].substring(1); // Mode
    // Only capitalize first letter
    mode = mode[0].toUpperCase() + mode.substr(1).toLowerCase();
    var user = arr[1]; // Username
    sendModesCalls(user, mode, msg, false);
  } else if (text.startsWith('/recent ')) {
    // Get recent matches on a user - Discord
    var user = text.substring(8); // Username
    sendRecentCalls(user, msg, false);
  } else if (text.startsWith('/season3 ')) {
    // Get all season 3 stats on a user
    var user = text.substring(9); // USername
    sendSeasonCalls(user, msg, false);
  }
});

// Sends message a different way based on whether it's for Discord or Telegram
function sendMessage(msg, content, isTelegram = true) {
  if (isTelegram) {
    return msg.reply.text(content, { asReply: true })
  } else {
    return discBot.createMessage(msg.channel.id, {
      embed: {
        color: 0x761FA1,
        author: {
          name: discBot.user.username,
          icon_url: discBot.user.avatarURL
        },
        title: 'Fortnite Statistics',
        description: `<@${msg.author.id}>\n\n${content}`,
        timestamp: new Date(),
        footer: {
          icon_url: discBot.user.avatarURL,
        }
      }
    });
  }
}

// Gets the Fortnite data for global (checks all platforms)
function sendGlobalCalls(user, msg, isTelegram = true) {
  formatGlobal(user, fortnite.PC) // Tries to find user on PC
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      formatGlobal(user, fortnite.XBOX) // Tries xbox if PC not found
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          formatGlobal(user, fortnite.PS4) // Tries ps4 if xbox not found
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

// Gets the Fortnite data for platforms
function sendPlatformsCalls(user, platform, msg, isTelegram = true) {
  formatGlobal(user, platforms[platform])
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => sendMessage(msg, err, isTelegram));
}

// Gets the Fortnite data for modes (checks all platforms)
function sendModesCalls(user, mode, msg, isTelegram = true) {
  // Checks if command is for season 3 because formatting is slightly different
  var currSeason = mode.endsWith('s3') ? true : false;
  formatModes(user, mode, modes[mode], fortnite.PC, currSeason)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      formatModes(user, mode, modes[mode], fortnite.XBOX, currSeason)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          formatModes(user, mode, modes[mode], fortnite.PS4, currSeason)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

// Gets the Fortnite data for recent (checks all platforms)
function sendRecentCalls(user, msg, isTelegram = true) {
  formatRecent(user, fortnite.PC)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      formatRecent(user, fortnite.XBOX)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          formatRecent(user, fortnite.PS4)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

// Gets the Fortnite data for Season 3 (checks all platforms)
function sendSeasonCalls(user, msg, isTelegram = true) {
  formatSeason(user, fortnite.PC)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      formatSeason(user, fortnite.XBOX)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          formatSeason(user, fortnite.PS4)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

teleBot.start();
discBot.connect();