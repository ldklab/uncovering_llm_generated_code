'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const modulePath = isProduction ? './index.cjs.production.min.js' : './index.cjs.development.js';

module.exports = require(modulePath);
