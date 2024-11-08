'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const productionModule = './dist/vue.cjs.prod.js';
const developmentModule = './dist/vue.cjs.js';

module.exports = require(isProduction ? productionModule : developmentModule);
