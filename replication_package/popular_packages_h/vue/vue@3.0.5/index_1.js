'use strict';

const env = process.env.NODE_ENV;
const isProduction = env === 'production';
const filePath = isProduction ? './dist/vue.cjs.prod.js' : './dist/vue.cjs.js';

module.exports = require(filePath);
