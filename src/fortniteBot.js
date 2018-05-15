require('dotenv').config();

const table = require('markdown-table');

const TeleBot = require('telebot');
const Eris = require('eris');
const teleBot = new TeleBot(process.env.TELEGRAM_TOKEN); // Telegram bot
const discBot = new Eris(process.env.DISCORD_TOKEN); // Discord bot

// Methods for actually getting Fortnite data are in fortniteData.js
const fortniteData = require('./fortniteData');
const getGlobalData = fortniteData.getGlobalData;
const getModesData = fortniteData.getModesData;
const getRecentData = fortniteData.getRecentData;
const getRoldData = fortniteData.getRoldData;
const getSeasonData = fortniteData.getSeasonData;
const setIdCache = fortniteData.setIdCache;
const getIdCache = fortniteData.getIdCache;

const constants = require('./constants');

// Telegram start message
teleBot.on(/^\/start$/i, msg => {
  sendMessage(msg, constants.START_MSG);
});

// Telegram bot responding to messages
teleBot.on(['text', 'forward'], msg => {
  let text = msg.text.toLowerCase();
  parseCommand(text, msg);
});

// Discord bot sets game to /info when it's ready
discBot.on('ready', () => {
  console.log('Fortnite Bot is ready!');
  discBot.editStatus('online', { name: '/info' });
});

// Discord bot responding to messages
discBot.on('messageCreate', msg => {
  let text = msg.content.toLowerCase();
  parseCommand(text, msg, false);
});

// Calls the right method based on the command
async function parseCommand(text, msg, isTelegram = true) {
  let user, tokens, id, platform;
  id = isTelegram ? msg.from.id : msg.author.id; // User ID on platform
  tokens = text.split(' ');
  if (text === '/info') {
    sendMessage(msg, constants.START_MSG, isTelegram);
  } else if (text.startsWith('/user')) {
    // Get global stats on a user
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(5);
    if (platform)
      sendPlatformsCalls(user, platform, msg, isTelegram);
    else
      sendGlobalCalls(user, msg, isTelegram);
  } else if (text.match(/^\/(pc|xbox|ps4)(.+)?$/i)) {
    // Get global stats on a user specifying 
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    let platform = tokens[0].substring(1); // Platform
    sendPlatformsCalls(user, platform, msg, isTelegram);
  } else if (text.match(/^\/(solo|duo|squad)(s3|s4)?(pc|xbox|ps4)?(.+)?$/i)) {
    // Get solo, duo, or squad stats for lifetime or season
    let mode = tokens[0].substring(1); // Mode
    // Only capitalize first letter
    mode = mode[0].toUpperCase() + mode.substr(1).toLowerCase();
    // Get platform by stripping the mode of the mode info
    platform = mode.replace(/(solo|duo|squad)/i, '');
    platform = platform.replace(/(s3|s4)/i, '');
    // Strip mode of the platform info
    mode = mode.replace(/(pc|xbox|ps4)/i, '');
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    if (platform.length === 0) {
      sendModesCalls(user, mode, msg, isTelegram);
    } else {
      let [season, top] = getModeInfo(mode);
      getModesData(user, mode, top, constants[platform.toUpperCase()], season)
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(err => sendMessage(msg, err, isTelegram));
    }
  } else if (text.startsWith('/recent')) {
    // Get recent matches on a user
    user = await getUser(tokens.length, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(7);
    if (platform) {
      getRecentData(user, constants[platform.toUpperCase()])
        .then(res => sendRecentMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    } else {
      sendRecentCalls(user, msg, isTelegram);
    }
  } else if (text.startsWith('/rold')) {
    // Get recent matches on a user (old format)
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(5);
    if (platform) {
      getRoldData(user, constants[platform.toUpperCase()])
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    } else {
      sendRoldCalls(user, msg, isTelegram);
    }
  } else if (text.match(/^\/(season|s)(3|4)(pc|xbox|ps4)?(.+)?$/i)) {
    // Get all season stats on a user
    tokens[0] = tokens[0].substring(1);
    let season = tokens[0].replace(/(pc|xbox|ps4)/i, '').substring(1);
    platform = tokens[0].replace(/(season|s)/i, '');
    platform = platform.replace(/(3|4)/, '');
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    if (platform.length === 0) {
      sendSeasonCalls(user, season, msg, isTelegram);
    } else {
      getSeasonData(user, season, constants[platform.toUpperCase()])
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    }
  } else if (text.startsWith('/set ')) {
    user = text.substring(5);
    setIdCache(user, id, isTelegram);
    sendMessage(msg, `Wrote ${user} to database.`, isTelegram);
  }
}

// Gets Fortnite user from the cache based on the messaging ID of the user
async function getUser(tokens, id, isTelegram) {
  if (tokens.length === 1) {
    try {
      user = await getIdCache(id, isTelegram);
    } catch (err) {
      return;
    }
  } else {
    user = tokens.slice(1).join(' ');
  }
  return user;
}

// Sends message a different way based on whether it's for Discord or Telegram
function sendMessage(msg, content, isTelegram = true) {
  if (isTelegram) {
    return msg.reply.text(content, { asReply: true });
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

// Sends message specially for /recent to show the table
function sendRecentMessage(msg, response, isTelegram = true) {
  let introMsg = response[0];
  let matrix = response[1];

  // Transpose the table, taken from link below
  // http://www.codesuck.com/2012/02/transpose-javascript-array-in-one-line.html
  matrix = matrix[0].map((_, c) => matrix.map(r => r[c]));
  matrix.unshift(['Mode', 'Matches', 'Wins', 'Kills', 'Time']);
  let mdTable = table(matrix, { align: Array(5).fill('c') });
  let mdRows = mdTable.split('\n');
  // Remove the 2nd row separating titles and values
  mdTable = mdRows[0] + '\n' + mdRows.slice(2).join('\n');
  // Replace the pipe separators between columns with spaces
  mdTable = mdTable.replace(/\|/g, ' ');
  let output = `${introMsg}\n\n\`\`\`text\n${mdTable}\n\`\`\``;

  if (isTelegram) {
    return teleBot.sendMessage(msg.chat.id, output, {
      replyToMessage: msg.message_id,
      parseMode: 'Markdown'
    });
  } else {
    return discBot.createMessage(msg.channel.id, {
      embed: {
        color: constants.DISCORD_COLOR,
        author: {
          name: discBot.user.username,
          icon_url: discBot.user.avatarURL
        },
        title: 'Fortnite Statistics',
        description: `<@${msg.author.id}>\n\n${output}`,
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
  let [season, top] = getModeInfo(mode);
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

// Gets season and top placements based on the mode
function getModeInfo(mode) {
  let season;
  if (mode.endsWith('s3') || mode.endsWith('s4'))
    season = mode.substr(-1);
  else
    season = '';
  let top = constants[mode.toUpperCase()].top;
  return [season, top];
}

// Gets the Fortnite data for recent (checks all platforms)
function sendRecentCalls(user, msg, isTelegram = true) {
  getRecentData(user, constants.PC)
    .then(res => sendRecentMessage(msg, res, isTelegram))
    .catch(err => {
      getRecentData(user, constants.XBOX)
        .then(resp => sendRecentMessage(msg, resp, isTelegram))
        .catch(error => {
          getRecentData(user, constants.PS4)
            .then(response => sendRecentMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

// Gets the Fortnite data for recent (checks all platforms) (old format)
function sendRoldCalls(user, msg, isTelegram = true) {
  getRoldData(user, constants.PC)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      getRoldData(user, constants.XBOX)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          getRoldData(user, constants.PS4)
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