/**
 * Methods to get Fortnite data from fortnite.js and Firebase cache
 */

require('dotenv').config();

const firebase = require('firebase/app');
require('firebase/database');
const app = firebase.initializeApp({
  apiKey: process.env.FIREBASE_KEY,
  authDomain: process.env.FIREBASE_DOMAIN,
  databaseURL: process.env.FIREBASE_URL,
  projectId: process.env.FIREBASE_ID,
  storageBucket: process.env.FIREBASE_BUCKET
});
const database = firebase.database();

const fortnite = require('fortnite.js');
const client = new fortnite(process.env.FORTNITE_KEY);

const fetch = require('node-fetch');
const Cheerio = require('cheerio');
const userAgents = require('./utils/userAgents');

// Methods for formatting the messages are in writeMsg.js
const writeMsg = require('./writeMsg');
const writeCompareMsg = writeMsg.writeCompareMsg;
const writeChallengesMsg = writeMsg.writeChallengesMsg;
const writeStoreMsg = writeMsg.writeStoreMsg;
const writeMatchesMsg = writeMsg.writeMatchesMsg;

const constants = require('./utils/constants');
const hashCode = require('./utils/hashCode').hashCode;

const errors = require('./utils/errors');
const getUserNotFoundError = errors.getUserNotFoundError;

// Temporary cache
const tempCache = {};
resetCache();

module.exports = {
  // Get stats for the given type of data (i.e. Global, Season, etc.)
  getData: (datatype, user, platform, args) => {
    return new Promise((resolve, reject) => {
      if (args && ['4', '5', '6'].includes(args.season))
        return reject(handleError(errors.DEPRECATED_ERROR, user));
      // Checks Firebase cache for season 3 data if season 3 data is desired
      let checkFbCache = args && args.season === '3';
      getFortniteInfo(user, platform, checkFbCache)
        .then(info => resolve(writeMsg[`write${datatype}Msg`](info, args)))
        .catch(err => reject(handleError(err, user)));
    });
  },

  // Compare two players
  getCompareData: (user1, user2, platform) => {
    return new Promise((resolve, reject) => {
      getFortniteInfo(user1, platform)
        .then(info1 => {
          getFortniteInfo(user2, platform)
            .then(info2 => resolve(writeCompareMsg(info1, info2)))
            .catch(e => reject(handleError(e, user1, user2)));
        }).catch(err => reject(handleError(err, user1, user2)));
    });
  },

  // Get leaderboard data
  getLeaderboardsData: () => {
    return new Promise((resolve, reject) => {
      fetch(constants.LEADERBOARDS_URL, {
        headers: {
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
          'Accept': '/',
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'identity'
        }
      }).then(res => res.text())
        .then(html => {
          let $ = Cheerio.load(html);
          let res = 'Leaderboards';
          let table = [['Rank'], ['Username'], ['Wins'], ['Games']];
          $('tr').each(function(i, elem) {
            if (i > 0 && i < 11) {
              table[0].push(i);
              const row = $(this).children();
              // Username
              table[1].push(row[1].children[1].children[0].data);
              // Wins
              table[2].push(row[2].children[0].data);
              // Games
              table[3].push(parseInt(row[3].children[0].data).toLocaleString());
            }
          });
          return resolve([res, table]);
        });
    });
  },

  // Get challenges
  getChallengesData: () => {
    return new Promise((resolve, reject) => {
      client.getChallenges(true)
        .then(info => resolve(writeChallengesMsg(info)))
        .catch(err => reject(handleError(err, 'challenges')));
    });
  },

  // Get store info
  getStoreData: () => {
    return new Promise((resolve, reject) => {
      client.getStore(true)
        .then(info => resolve(writeStoreMsg(info)))
        .catch(err => reject(handleError(err, 'store')));
    });
  },

  // Get matches
  getMatchesData: (user, platform) => {
    return new Promise((resolve, reject) => {
      getFortniteInfo(user, platform, false)
        .then(info => {
          client.getMatches(info.accountId, true)
            .then(matchInfo => {
              return resolve(writeMatchesMsg(matchInfo, info.epicUserHandle, info.platformNameLong));
            })
            .catch(err => reject(handleError(err, user + ' ' + info.accountId)));
        })
        .catch(err => reject(handleError(err, user)));
    });
  },

  // Map Telegram or Discord user ID to Fortnite username
  setIdCache: (user, id, isTelegram = true) => {
    let path = isTelegram ? 'telegram/' : 'discord/';
    database.ref(path + id).set({ username: user });
  },

  // Get username from user ID
  getIdCache: (id, isTelegram = true) => {
    return new Promise((resolve, reject) => {
      let path = isTelegram ? 'telegram/' : 'discord/';
      database.ref(path + id).once('value').then(snapshot => {
        if (!snapshot.val())
          return reject(errors.NOT_MAPPED_ERROR);
        return resolve(snapshot.val().username);
      });
    });
  }
};

// Gets the user's Fortnite info from cache or fortnite.js
function getFortniteInfo(user, platform, checkFbCache) {
  return new Promise((resolve, reject) => {
    if (checkFbCache) {
      database.ref(`users/${hashCode(user)}`).once('value').then(snapshot => {
        if (!snapshot.val())
          return reject(errors.DEPRECATED_ERROR);
        return resolve(snapshot.val());
      });
    } else {
      // Look for user in cache
      if (user in tempCache[platform])
        return resolve(tempCache[platform][user]);
      // If not found in cache, use fortnite.js to get the user
      client.get(user + '/', platform, true)
        .then(info => {
          console.log(info);
          // Store user's info in the temporary cache
          tempCache[platform][user] = info;
          return resolve(info);
        }).catch(err => {
          return reject(err);
        });
    }
  });
}

// Handle error from getting fortnite.js data
function handleError(err, user1, user2) {
  console.error(`Username: ${user1} ${user2 ? ` ${user2} ` : ''}-- Error: ${err}`);
  if (err === errors.UNAVAILABLE_ERROR.INPUT)
    return err.UNAVAILABLE_ERROR.OUTPUT;
  else if (err === errors.NOT_FOUND_ERROR)
    return getUserNotFoundError(user1, user2);
  else
    return err;
}

// Debug logs for Firebase
firebase.database.enableLogging(message => {
  console.log('[FIREBASE]', message);
});

// Reset the temporary cache every 5 minutes
setInterval(resetCache, 300000);
function resetCache() {
  console.log(`[TEMP CACHE] Resetting at ${new Date().toString()}`);
  // Temporary cache
  tempCache[constants.PC] = {};
  tempCache[constants.XBOX] = {};
  tempCache[constants.PS4] = {};
}