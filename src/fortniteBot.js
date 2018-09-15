require('dotenv').config();

const table = require('markdown-table');

const TeleBot = require('telebot');
const Eris = require('eris');
const teleBot = new TeleBot(process.env.TELEGRAM_TOKEN); // Telegram bot
const discBot = new Eris(process.env.DISCORD_TOKEN); // Discord bot

// Methods for actually getting Fortnite data are in fortniteData.js
const fortniteData = require('./fortniteData');
const getData = fortniteData.getData;
const getCompareData = fortniteData.getCompareData;
const getIdCache = fortniteData.getIdCache;
const setIdCache = fortniteData.setIdCache;
const getLeaderboardsData = fortniteData.getLeaderboardsData;
const getChallengesData = fortniteData.getChallengesData;
const getStoreData = fortniteData.getStoreData;
const getMatchesData = fortniteData.getMatchesData;

const constants = require('./utils/constants');
const modes = require('./utils/modes');

const errors = require('./utils/errors');
const getNoRecentMatchesError = errors.getNoRecentMatchesError;

let scrapeCalls = 0;

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

  if (text.match(/^\/(info|help)$/)) {
    sendMessage(msg, constants.START_MSG, isTelegram);
  } else if (text.match(/^\/user(pc|xbox|ps4)?(\s.+)?$/)) {
    // Get global stats on a user

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(5); // Platform
    if (platform)
      sendPlatformsCalls(user, platform, msg, isTelegram);
    else
      sendMethodCalls('Global', user, msg, isTelegram);
  } else if (text.match(/^\/(pc|xbox|ps4)(\s.+)?$/)) {
    // Get global stats on a user specifying platform

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(1); // Platform
    sendPlatformsCalls(user, platform, msg, isTelegram);
  } else if (text.match(/^\/(solo|duo|squad)(s[3-5])?(pc|xbox|ps4)?(\s.+)?$/)) {
    // Get solo, duo, or squad stats for lifetime or season

    let mode = tokens[0].substring(1); // Mode
    // Only capitalize first letter
    mode = mode[0].toUpperCase() + mode.substr(1).toLowerCase();
    // Get platform by stripping the mode of the mode info
    platform = mode.replace(/(solo|duo|squad)/i, '');
    platform = platform.replace(/s[3-5]/i, '');
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
      getData('Modes', user, constants[platform.toUpperCase()], {
        mode: mode,
        top: top,
        season: season
      }).then(res => sendMessage(msg, res, isTelegram))
        .catch(err => sendMessage(msg, err, isTelegram));
    }
  } else if (text.match(/^\/recent(pc|xbox|ps4)?(\s.+)?$/)) {
    // Get recent matches on a user

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(7);
    if (platform) {
      getData('Recent', user, constants[platform.toUpperCase()])
        .then(res => sendMdTableMessage(msg, res, isTelegram))
        .catch(e => {
          err = handleMdError(e, msg, isTelegram);
          if (err)
            sendMessage(msg, e, isTelegram);
        });
    } else {
      sendRecentCalls(user, msg, isTelegram);
    }
  } else if (text.match(/^\/rold(pc|xbox|ps4)?(\s.+)?$/)) {
    // Get recent matches on a user (old format)

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(5);
    if (platform) {
      getData('Rold', user, constants[platform.toUpperCase()])
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    } else {
      sendMethodCalls('Rold', user, msg, isTelegram);
    }
  } else if (text.match(/^\/(season|s)[3-5](pc|xbox|ps4)?(\s.+)?$/)) {
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
      sendMethodCalls('Season', user, msg, isTelegram, { season: season });
    } else {
      getData('Season', user, constants[platform.toUpperCase()], { season: season })
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    }
  } else if (text.match(/^\/set\s.+$/)) {
    // Write username to database

    user = text.substring(5);
    setIdCache(user, id, isTelegram);
    sendMessage(msg, `Wrote ${user} to database.`, isTelegram);
  } else if (text.match(/^\/rating(pc|xbox|ps4)?(\s.+)?$/)) {
    // Get TRN ratings on a user

    // Get username, exit if not found
    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(7);
    if (platform) {
      getData('Rating', user, constants[platform.toUpperCase()])
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    } else {
      sendMethodCalls('Rating', user, msg, isTelegram);
    }
  } else if (text.match(/^\/kd(pc|xbox|ps4)?(\s.+)?$/)) {
    // Get KD stats on a user

    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(3);
    if (platform) {
      getData('Kd', user, constants[platform.toUpperCase()])
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    } else {
      sendMethodCalls('Kd', user, msg, isTelegram);
    }
  } else if (text.match(/^\/compare(\s.+)?$/)) {
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
  } else if (text.match(/^\/(winrate|wr)(pc|xbox|ps4)?(\s.+)?$/)) {
    // Get win rate stats on a user

    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(tokens[0].startsWith('winrate') ? 8 : 3);
    if (platform) {
      getData('Winrate', user, constants[platform.toUpperCase()])
        .then(res => sendMessage(msg, res, isTelegram))
        .catch(e => sendMessage(msg, e, isTelegram));
    } else {
      sendMethodCalls('Winrate', user, msg, isTelegram);
    }
  } else if (text === '/leaderboards') {
    // Get leaderboards data
    if (scrapeCalls < 3) {
      scrapeCalls++;
      getLeaderboardsData()
      .then(res => sendMdTableMessage(msg, res, isTelegram))
      .catch(e => {
        err = handleMdError(e, msg, isTelegram);
        if (err)
          sendMessage(msg, e, isTelegram);
      });
    }
  } else if (text === '/challenges') {
    getChallengesData()
      .then(res => sendMdTableMessage(msg, res, isTelegram))
      .catch(e => {
        err = handleMdError(e, msg, isTelegram);
        if (err)
          sendMessage(msg, e, isTelegram);
      });
  } else if (text === '/store') {
    getStoreData()
      .then(res => sendMdTableMessage(msg, res, isTelegram))
      .catch(e => {
        err = handleMdError(e, msg, isTelegram);
        if (err)
          sendMessage(msg, e, isTelegram);
      });
  } else if (text.match(/^\/matches(pc|xbox|ps4)?(\s.+)?$/)) {
    // Get match history on a user

    user = await getUser(tokens, id, isTelegram);
    if (!user)
      return;
    platform = tokens[0].substring(8);
    if (platform) {
      getMatchesData(user, constants[platform.toUpperCase()])
        .then(res => sendMdTableMessage(msg, res, isTelegram))
        .catch(e => {
          err = handleMdError(e, msg, isTelegram);
          if (err)
            sendMessage(msg, e, isTelegram);
        });
    } else {
      sendMatchesCalls(user, msg, isTelegram);
    }
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
  let user1;
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
  let introMsg = response[0];
  // Replace underscores with escaped underscores because of Markdown parsing
  introMsg = introMsg.replace(/_/g, '\\_');
  let matrix = response[1];
  let output;
  // No recent matches found for the user
  if (matrix[0].length === 1) {
    let user = introMsg.split('\n')[0].split(' ').slice(3).join(' ').slice(0, -1);
    output = getNoRecentMatchesError(user);
  } else {
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
    output = `${introMsg}\n\n\`\`\`text\n${mdTable}\n\`\`\``;
  }

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
 * Handles errors with Markdown
 * @param {(Object|string)} err object containing error info
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function handleMdError(err, msg, isTelegram = true) {
  if (err.description && err.description.startsWith(errors.MD_PARSE_ERROR.INPUT)) {
    sendMessage(msg, errors.MD_PARSE_ERROR.OUTPUT, isTelegram);
    return;
  }
  return err;
}

/**
 * Gets the Fortnite data for platforms
 * @param {string} user Fortnite username
 * @param {string} platform platform to search Fortnite player on
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendPlatformsCalls(user, platform, msg, isTelegram = true) {
  getData('Global', user, constants[platform.toUpperCase()])
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
  // Checks what season command is for because formatting is slightly different
  let [season, top] = getModeInfo(mode);
  sendMethodCalls('Modes', user, msg, isTelegram, {
    mode: mode,
    top: top,
    season: season
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
  const season = ['3', '4', '5'].includes(lastChar) ? lastChar : '';
  // Each mode has a different way of storing times a player made it to top x
  const top = modes[mode.toUpperCase()].top;
  return [season, top];
}

/**
 * Gets the Fortnite data for recent (checks all platforms)
 * @param {string} user Fortnite username
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendRecentCalls(user, msg, isTelegram = true) {
  getData('Recent', user, constants.PC)
    .then(res => sendMdTableMessage(msg, res, isTelegram))
    .catch(err => {
      err = handleMdError(err, msg, isTelegram);
      if (!err)
        return;
      getData('Recent', user, constants.XBOX)
        .then(resp => sendMdTableMessage(msg, resp, isTelegram))
        .catch(error => {
          error = handleMdError(error, msg, isTelegram);
          if (!error)
            return;
          getData('Recent', user, constants.PS4)
            .then(response => sendMdTableMessage(msg, response, isTelegram))
            .catch(e => {
              e = handleMdError(e, msg, isTelegram);
              if (e)
                sendMessage(msg, e, isTelegram);
            });
        });
    });
}

/**
 * Gets the Fortnite data for matches (checks all platforms)
 * @param {string} user Fortnite username
 * @param {Object} msg object containing info about the user's message
 * @param {boolean=} isTelegram true if message is from Telegram, false if from Discord
 */
function sendMatchesCalls(user, msg, isTelegram) {
  getMatchesData(user, constants.PC)
    .then(res => sendMdTableMessage(msg, res, isTelegram))
    .catch(err => {
      err = handleMdError(err, msg, isTelegram);
      if (!err)
        return;
      getMatchesData(user, constants.XBOX)
        .then(resp => sendMdTableMessage(msg, resp, isTelegram))
        .catch(error => {
          error = handleMdError(error, msg, isTelegram);
          if (!error)
            return;
          getMatchesData(user, constants.PS4)
            .then(response => sendMdTableMessage(msg, response, isTelegram))
            .catch(e => {
              e = handleMdError(e, msg, isTelegram);
              if (e)
                sendMessage(msg, e, isTelegram);
            });
        });
    });
}

/**
 * Gets the data for a method based on its name (used for most of the commands)
 * @param {string} datatype type of data to get data on (i.e. Global, Season, etc.)
 * @param {string} user Fortnite username
 * @param {Object} msg object containing info about the user's message
 * @param {boolean} isTelegram true if message is from Telegram, false if from Discord
 * @param {Object=} args optional arguments for commands that need them
 * @param {string=} args.mode mode to get Fortnite data of
 * @param {string=} args.season season to get Fortnite data of
 */
function sendMethodCalls(datatype, user, msg, isTelegram, args) {
  getData(datatype, user, constants.PC, args)
    .then(res => sendMessage(msg, res, isTelegram))
    .catch(err => {
      getData(datatype, user, constants.XBOX, args)
        .then(resp => sendMessage(msg, resp, isTelegram))
        .catch(error => {
          getData(datatype, user, constants.PS4, args)
            .then(response => sendMessage(msg, response, isTelegram))
            .catch(e => sendMessage(msg, e, isTelegram));
        });
    });
}

teleBot.start();
discBot.connect();

resetNumCalls();
setInterval(resetNumCalls, 60000);
function resetNumCalls() {
  console.log('[Calls]', 'Resetting number of calls at ' + new Date().toString());
  scrapeCalls = 0;
}
