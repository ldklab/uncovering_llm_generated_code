'use strict';

const env = process.env.NODE_ENV;
const reactPath = env === 'production' ? './cjs/react.production.min.js' : './cjs/react.development.js';

module.exports = require(reactPath);
