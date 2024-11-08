'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const productionPath = './cjs/react-refresh-runtime.production.min.js';
const developmentPath = './cjs/react-refresh-runtime.development.js';

module.exports = isProduction ? require(productionPath) : require(developmentPath);
