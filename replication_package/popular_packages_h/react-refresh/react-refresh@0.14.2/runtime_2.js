'use strict';

const productionModule = './cjs/react-refresh-runtime.production.min.js';
const developmentModule = './cjs/react-refresh-runtime.development.js';

const config = process.env.NODE_ENV === 'production' ? productionModule : developmentModule;

module.exports = require(config);
