'use strict';

// Importing required utility functions from their respective files
const utilities = {
  getOptions: require('./getOptions'),
  parseQuery: require('./parseQuery'),
  stringifyRequest: require('./stringifyRequest'),
  getRemainingRequest: require('./getRemainingRequest'),
  getCurrentRequest: require('./getCurrentRequest'),
  isUrlRequest: require('./isUrlRequest'),
  urlToRequest: require('./urlToRequest'),
  parseString: require('./parseString'),
  getHashDigest: require('./getHashDigest'),
  interpolateName: require('./interpolateName')
};

// Exporting the utilities as module exports
module.exports = utilities;
