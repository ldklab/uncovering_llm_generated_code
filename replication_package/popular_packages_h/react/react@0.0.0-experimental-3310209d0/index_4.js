'use strict';

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';
const buildPath = isProduction ? './cjs/react.production.min.js' : './cjs/react.development.js';

module.exports = require(buildPath);
