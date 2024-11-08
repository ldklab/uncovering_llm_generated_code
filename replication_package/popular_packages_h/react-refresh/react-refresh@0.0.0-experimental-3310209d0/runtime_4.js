'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const libraryPath = isProduction ? './cjs/react-refresh-runtime.production.min.js' : './cjs/react-refresh-runtime.development.js';

module.exports = require(libraryPath);
