/**
 * Modes in Fortnite
 */

const constants = require('./constants');

module.exports = {
  SOLO: {
    top: [10, 25],
    id: 'p2',
    name: 'Solo'
  },
  DUO: {
    top: [5, 12],
    id: 'p10',
    name: 'Duo'
  },
  SQUAD: {
    top: [3, 6],
    id: 'p9',
    name: 'Squad'
  },
  SOLOS3: {
    top: [10, 25],
    id: 'curr_p2',
    name: 'Season 3 Solo'
  },
  DUOS3: {
    top: [5, 12],
    id: 'curr_p10',
    name: 'Season 3 Duo'
  },
  SQUADS3: {
    top: [3, 6],
    id: 'curr_p9',
    name: 'Season 3 Squad'
  },
  // SOLOS4: {
  //   top: [10, 25],
  //   id: 'prior_p2',
  //   name: 'Season 4 Solo'
  // },
  // DUOS4: {
  //   top: [5, 12],
  //   id: 'prior_p10',
  //   name: 'Season 4 Duo'
  // },
  // SQUADS4: {
  //   top: [3, 6],
  //   id: 'prior_p9',
  //   name: 'Season 4 Squad'
  // },
  [`SOLOS${constants.CURR_SEASON}`]: {
    top: [10, 25],
    id: 'curr_p2',
    name: `Season ${constants.CURR_SEASON} Solo`
  },
  [`DUOS${constants.CURR_SEASON}`]: {
    top: [5, 12],
    id: 'curr_p10',
    name: `Season ${constants.CURR_SEASON} Duo`
  },
  [`SQUADS${constants.CURR_SEASON}`]: {
    top: [3, 6],
    id: 'curr_p9',
    name: `Season ${constants.CURR_SEASON} Squad`
  }
};