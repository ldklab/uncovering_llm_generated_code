'use strict';

let reactLibrary;

if (process.env.NODE_ENV === 'production') {
  reactLibrary = require('./cjs/react.production.min.js');
} else {
  reactLibrary = require('./cjs/react.development.js');
}

module.exports = reactLibrary;
