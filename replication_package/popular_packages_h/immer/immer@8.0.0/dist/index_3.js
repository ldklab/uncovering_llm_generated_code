'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const modulePath = isProduction ? './immer.cjs.production.min.js' : './immer.cjs.development.js';
module.exports = require(modulePath);
