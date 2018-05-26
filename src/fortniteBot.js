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
const getRatingData = fortniteData.getRatingData;
const getKdData = fortniteData.getKdData;
const getCompareData = fortniteData.getCompareData;
const setIdCache = fortniteData.setIdCache;
const getIdCache = fortniteData.getIdCache;

const constants = require('./constants');

// Telegram start message
teleBot.on(/^\/start$/i, msg => {
  sendMessage(msg, constants.START_MSG);
});

// Telegram bot responding to messages
teleBot.on(['text', 'forward'], msg => {
  const text = msg.text.toLowerCase();
  parseCommand(text, msg);
});

// Discord bot sets game to /info when it's ready
discBot.on('ready', () => {
  console.log('[DISCORD] Fortnite Bot is ready!');
  discBot.editStatus('online', { name: '/help' });
});

// Discord bot responding to messages
discBot.on('messageCreate', msg => {
  const text = msg.content.toLowerCase();
  parseCommand(text, msg, false);
});

/**
 * Parses the command to choose what data to get from Fortnite
 * @param {string} text user's message
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
async function parseCommand(text, msg, isTelegram = true) {
  let user, tokens, id, platform;
  id = isTelegram ? msg.from.id : msg.author.id; // User account ID on platform
  // Match non white space to get command and argument
  // Accounts for accidental extra whitespace by matching instead of splitting
  tokens = text.match(/\S+/g);

  if (text.match(/^\/(info|help)$/i)) {
    sendMessage(msg, constants.START_MSG, isTelegram);
  } else if (text.startsWith('/user')) {
    // Get global stats on a user

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(5); // Platform
    if (platform)
      sendPlatformsCalls(user, platform, msg, isTelegram);
    else
      sendGlobalCalls(user, msg, isTelegram);
  } else if (text.match(/^\/(pc|xbox|ps4)(.+)?$/i)) {
    // Get global stats on a user specifying platform

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(1); // Platform
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
    // Get username, exit if not found
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

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(7);
    if (platform) {
      getRecentData(user, constants[platform.toUpperCase()])
        .then(res => sendMdTableMessage(msg, res, isTelegram))
        .catch(e => {
          err = handleMdError(e, msg, isTelegram);
          if (err)
            sendMessage(msg, e, isTelegram);
        });
    } else {
      sendRecentCalls(user, msg, isTelegram);
    }
  } else if (text.startsWith('/rold')) {
    // Get recent matches on a user (old format)

    // Get username, exit if not found
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

    // Get season and platform by stripping data from the command text
    const strippedData = tokens[0].substring(1).replace(/(season|s)/i, '');
    const season = strippedData.substring(0, 1);
    platform = strippedData.substring(1);
    // Get username, exit if not found
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
    // Write username to database

    user = text.substring(5);
    setIdCache(user, id, isTelegram);
    sendMessage(msg, `Wrote ${user} to database.`, isTelegram);
  } else if (text.startsWith('/rating')) {
    // Get TRN ratings on a user

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(7);
    if (platform) {
      getRatingData(user, constants[platform.toUpperCase()])
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    } else {
      sendRatingCalls(user, msg, isTelegram);
    }
  } else if (text.startsWith('/kd')) {
    // Get KD stats on a user

    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(3);
    if (platform) {
      getKdData(user, constants[platform.toUpperCase()])
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    } else {
      sendKdCalls(user, msg, isTelegram);
    }
  } else if (text.startsWith('/compare')) {
    // Compare two users

    let users = await getTwoUsers(tokens, id, isTelegram);
    if (!users)
      return;
    getCompareData(users[0], users[1], constants.PC)
      .then(res => sendMdTableMessage(msg, res, isTelegram))
      .catch(e => {
        err = handleMdError(e, msg, isTelegram);
        if (err)
          sendMessage(msg, e, isTelegram);
      });
  }
}

/**
 * Gets Fortnite user from the cache or from the argument
 * @param {string[]} tokens words from the user's message
 * @param {number} id user's ID on the messaging platform
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
async function getUser(tokens, id, isTelegram = true) {
  let user;
  // Tokens is of length 1 if no user was passed in as an argument
  if (tokens.length === 1) {
    try {
      // Check cache for the username associated with the messaging ID
      user = await getIdCache(id, isTelegram);
    } catch (err) {
      // Exit if no user found
      return;
    }
  } else {
    // Get the username if it was passed in as an argument
    user = tokens.slice(1).join(' ');
  }
  return user;
}

/**
 * Gets two Fortnite users from the cache or from the argument (used in /compare)
 * @param {string[]} tokens words from the user's message
 * @param {number} id user's ID on the messaging platform
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
async function getTwoUsers(tokens, id, isTelegram = true) {
  let user1, user2;
  let subtokens = tokens.slice(1).join(' ').split(/,\s?/g);
  if (subtokens.length === 1) {
    try {
      // Check cache for first user
      user1 = await getIdCache(id, isTelegram);
    } catch (err) {
      // Exit if no user found
      return;
    }
    return [user1, subtokens[0]];
  } else if (subtokens.length === 2) {
    return subtokens;
  } else {
    // No more than two users are supported
    return;
  }
}

/**
 * Sends message a different way based on whether it's for Discord or Telegram
 * @param {Object} msg object containing info about the user's message
 * @param {string} content content to put in the message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendMessage(msg, content, isTelegram = true) {
  if (isTelegram) {
    // Send Telegram message if message is from Telegram
    return msg.reply.text(content, { asReply: true });
  } else {
    // Send Discord embed if message is from Discord
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

/**
 * Sends message specially for Markdown to show the table
 * @param {Object} msg object containing info about the user's message
 * @param {Array} response intro message and table of recent matches
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendMdTableMessage(msg, response, isTelegram = true) {
  const introMsg = response[0];
  let matrix = response[1];
  // Transpose the table, taken from link below
  // http://www.codesuck.com/2012/02/transpose-javascript-array-in-one-line.html
  matrix = matrix[0].map((_, c) => matrix.map(r => r[c]));
  // Create the markdown table from the transposed table
  let mdTable = table(matrix, { align: Array(matrix.length).fill('c') });
  let mdRows = mdTable.split('\n');
  // Remove the 2nd row separating titles and values
  mdTable = mdRows[0] + '\n' + mdRows.slice(2).join('\n');
  // Replace the pipe separators between columns with spaces
  mdTable = mdTable.replace(/\|/g, ' ');
  // Format the message into intro message and the table in a code block
  const output = `${introMsg}\n\n\`\`\`text\n${mdTable}\n\`\`\``;

  if (isTelegram) {
    // Sends a markdown message to Telegram with recent matches in code block
    return teleBot.sendMessage(msg.chat.id, output, {
      replyToMessage: msg.message_id,
      parseMode: 'Markdown'
    });
  } else {
    // Sends a Discord embed with recent matches in code block
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

/**
 * Sends message specially for /compare to show the table
 * @param {Object} msg object containing info about the user's message
 * @param {Array} response intro message and table to compare two users
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendCompareMessage(msg, response, isTelegram = true) {
  const introMsg = response[0];
  letmatr
}

/**
 * Gets the Fortnite data for global (checks all platforms)
 * @param {string} user Fortnite username
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
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

/**
 * Gets the Fortnite data for platforms
 * @param {string} user Fortnite username
 * @param {string} platform platform to search Fortnite player on
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendPlatformsCalls(user, platform, msg, isTelegram = true) {
  getGlobalData(user, constants[platform.toUpperCase()])
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => sendMessage(msg, err, isTelegram));
}

/**
 * Gets the Fortnite data for modes (checks all platforms)
 * @param {string} user Fortnite username
 * @param {string} mode mode to get Fortnite data of
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
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

/**
 * Gets season and top placements based on the mode
 * @param {string} mode mode to get Fortnite data of
 */
function getModeInfo(mode) {
  const lastChar = mode.substr(-1);
  // Season is the season's number if the mode is a season based command
  // Otherwise it's an empty string
  const season = ['3', '4'].includes(lastChar) ? lastChar : '';
  // Each mode has a different way of storing times a player made it to top x
  const top = constants[mode.toUpperCase()].top;
  return [season, top];
}

/**
 * Gets the Fortnite data for recent (checks all platforms)
 * @param {string} user Fortnite username
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendRecentCalls(user, msg, isTelegram = true) {
  getRecentData(user, constants.PC)
    .then(res => sendMdTableMessage(msg, res, isTelegram))
    .catch(err => {
      err = handleMdError(err, msg, isTelegram);
      if (!err)
        return;
      getRecentData(user, constants.XBOX)
        .then(resp => sendMdTableMessage(msg, resp, isTelegram))
        .catch(error => {
          err = handleMdError(err, msg, isTelegram);
          if (!err)
            return;
          getRecentData(user, constants.PS4)
            .then(response => sendMdTableMessage(msg, response, isTelegram))
            .catch(e => {
              err = handleMdError(err, msg, isTelegram);
              if (err)
                sendMessage(msg, e, isTelegram);
            });
        });
    });
}

/**
 * Handles errors with Markdown
 * @param {(Object|string)} err object containing error info
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function handleMdError(err, msg, isTelegram = true) {
  if (err.description.startsWith(constants.MD_PARSE_ERROR_INPUT)) {
    sendMessage(msg, constants.MD_PARSE_ERROR_OUTPUT, isTelegram);
    return;
  }
  return err;
}

/**
 * Gets the Fortnite data for recent (checks all platforms) (old format)
 * @param {string} user Fortnite username
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
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

/**
 * Gets the Fortnite data for seasons (checks all platforms)
 * @param {string} user Fortnite username
 * @param {string} season season to get Fortnite data of
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
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

/**
 * Gets the TRN rating data
 * @param {string} user Fortnite username
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendRatingCalls(user, msg, isTelegram = true) {
  getRatingData(user, constants.PC)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      getRatingData(user, constants.XBOX)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          getRatingData(user, constants.PS4)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

/**
 * Gets the KD data
 * @param {string} user Fortnite username
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendKdCalls(user, msg, isTelegram = true) {
  getKdData(user, constants.PC)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      getKdData(user, constants.XBOX)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          getKdData(user, constants.PS4)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

teleBot.start();
discBot.connect();