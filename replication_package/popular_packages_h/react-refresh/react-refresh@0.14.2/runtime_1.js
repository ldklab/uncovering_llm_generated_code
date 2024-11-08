'use strict';

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';
const path = './cjs/';

const productionModule = 'react-refresh-runtime.production.min.js';
const developmentModule = 'react-refresh-runtime.development.js';

const modulePath = isProduction ? path + productionModule : path + developmentModule;

module.exports = require(modulePath);
