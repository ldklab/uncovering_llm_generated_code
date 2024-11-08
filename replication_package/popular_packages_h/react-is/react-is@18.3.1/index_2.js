'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const fileName = isProduction ? './cjs/react-is.production.min.js' : './cjs/react-is.development.js';

module.exports = require(fileName);
