'use strict'

const environment = process.env.NODE_ENV;
const productionModule = './index.cjs.production.min.js';
const developmentModule = './index.cjs.development.js';

module.exports = environment === 'production' ? require(productionModule) : require(developmentModule);
