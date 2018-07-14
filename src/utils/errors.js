/**
 * Constants and methods to write error messages
 */

module.exports = {
  NOT_FOUND_ERROR: 'HTTP Player Not Found',
  NOT_MAPPED_ERROR: 'No user mapped to your messaging account. Use /set to map a Fortnite username.',
  DEPRECATED_ERROR: 'Deprecated command.',
  UNAVAILABLE_ERROR: {
    INPUT: 'HTTP Error: 503 Service Unavailable',
    OUTPUT: 'Fortnite Tracker API is unavailable.'
  },
  MD_PARSE_ERROR: {
    INPUT: 'Bad Request: can\'t parse entities: ',
    OUTPUT: 'Error with parsing username in Markdown. Try using /rold instead.'
  },
  getUserNotFoundError: (user1, user2) => user2 ? `User ${user1} or ${user2} not found.` : `User ${user1} not found.`,
  getModeNotFoundError: (user, mode) => `User ${user} has never played ${mode}.`,
  getNoRecentMatchesError: user => `User ${user} has no recent matches.`
};