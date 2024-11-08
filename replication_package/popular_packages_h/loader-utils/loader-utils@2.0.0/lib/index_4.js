'use strict';

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

module.exports = utilities;
