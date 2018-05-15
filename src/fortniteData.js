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
const writeGlobalMsg = writeMsg.writeGlobalMsg;
const writeModesMsg = writeMsg.writeModesMsg;
const writeRecentMsg = writeMsg.writeRecentMsg;
const writeRoldMsg = writeMsg.writeRoldMsg;
const writeSeasonMsg = writeMsg.writeSeasonMsg;

module.exports = {
  // Get global stats
  getGlobalData: (user, platform) => {
    return new Promise((resolve, reject) => {
      client.get(user, platform, true)
        .then(info => {
          return resolve(writeGlobalMsg(info));
        }).catch(err => {
          return reject(handleError(err));
        });
    });
  },

  // Get solo/duo/squad lifetime/season3 stats
  getModesData: (user, mode, nums, platform, season) => {
    return new Promise((resolve, reject) => {
      client.get(user, platform, true)
        .then(info => {
          return resolve(writeModesMsg(info, season, mode, nums));
        }).catch(err => {
          return reject(handleError(err));
        });
    });
  },

  // Get recent matches stats
  getRecentData: (user, platform) => {
    return new Promise((resolve, reject) => {
      client.get(user, platform, true)
        .then(info => {
          return resolve(writeRecentMsg(info));
        }).catch(err => {
          return reject(handleError(err));
        });
    });
  },

  // Get recent matches stats (old format)
  getRoldData: (user, platform) => {
    return new Promise((resolve, reject) => {
      client.get(user, platform, true)
        .then(info => {
          return resolve(writeRoldMsg(info));
        }).catch(err => {
          return reject(handleError(err));
        });
    });
  },

  // Get all season stats
  getSeasonData: (user, season, platform) => {
    return new Promise((resolve, reject) => {
      client.get(user, platform, true)
        .then(info => {
          return resolve(writeSeasonMsg(info, season));
        }).catch(err => {
          return reject(handleError(err));
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
          return reject('User not found.');
        return resolve(snapshot.val().username);
      });
    });
  }
};

// Handle error from getting fortnite.js data
function handleError(err) {
  console.log(err);
  if (err === 'HTTP Player Not Found')
    return 'User not found.';
  else
    return 'Error found when getting user info.';
}

// Debug logs for Firebase
firebase.database.enableLogging(message => {
  console.log("[FIREBASE]", message);
});

// Hashcode for strings, used for caching data, taken from answer in link below
// stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
String.prototype.hashCode = function () {
  let hash = 0;
  if (this.length === 0) {
    return hash;
  }
  for (let i = 0; i < this.length; i++) {
    let char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}