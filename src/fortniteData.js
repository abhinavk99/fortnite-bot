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

// Methods for formatting the messages are in writeMsg.js
const writeMsg = require('./writeMsg');
const writeCompareMsg = writeMsg.writeCompareMsg;

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
      getFortniteInfo(user, platform)
        .then(info => {
          return resolve(writeMsg[`write${datatype}Msg`](info, args));
        }).catch(err => {
          return reject(handleError(err, user));
        });
    });
  },

  // Compare two players
  getCompareData: (user1, user2, platform) => {
    return new Promise((resolve, reject) => {
      getFortniteInfo(user1, platform)
        .then(info1 => {
          getFortniteInfo(user2, platform)
            .then(info2 => {
              return resolve(writeCompareMsg(info1, info2));
            }).catch(e => {
              return reject(handleError(e, user1, user2));
            });
        }).catch(err => {
          return reject(handleError(err, user1, user2));
        });
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
        if (snapshot.val() == null)
          return reject(errors.NOT_MAPPED_ERROR);
        return resolve(snapshot.val().username);
      });
    });
  }
};

// Gets the user's Fortnite info from cache or fortnite.js
function getFortniteInfo(user, platform) {
  return new Promise((resolve, reject) => {
    // Look for user in cache
    if (user in tempCache[platform])
      return resolve(tempCache[platform][user]);
    // If not found in cache, use fortnite.js to get the user
    client.get(user, platform, true)
      .then(info => {
        // Store user's info in the temporary cache
        tempCache[platform][user] = info;
        return resolve(info);
      }).catch(err => {
        return reject(err);
      });
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