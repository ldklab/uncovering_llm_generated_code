'use strict';

const reactIsPath = process.env.NODE_ENV === 'production' 
  ? './cjs/react-is.production.min.js'
  : './cjs/react-is.development.js';

module.exports = require(reactIsPath);
