'use strict';

const path = process.env.NODE_ENV === 'production'
  ? './cjs/react.production.min.js'
  : './cjs/react.development.js';

module.exports = require(path);
