'use strict';

const env = process.env.NODE_ENV;
const isProduction = env === 'production';
const modulePath = isProduction ? './emotion-react.cjs.prod.js' : './emotion-react.cjs.dev.js';

module.exports = require(modulePath);
