'use strict';

const productionModule = './immer.cjs.production.min.js';
const developmentModule = './immer.cjs.development.js';

const isProduction = process.env.NODE_ENV === 'production';
const modulePath = isProduction ? productionModule : developmentModule;

module.exports = require(modulePath);
