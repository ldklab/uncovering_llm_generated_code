'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const reactPath = isProduction ? './cjs/react.production.min.js' : './cjs/react.development.js';

module.exports = require(reactPath);
