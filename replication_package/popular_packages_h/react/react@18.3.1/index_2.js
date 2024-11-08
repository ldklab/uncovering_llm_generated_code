'use strict';

const productionReact = './cjs/react.production.min.js';
const developmentReact = './cjs/react.development.js';

const isProduction = process.env.NODE_ENV === 'production';
const reactPath = isProduction ? productionReact : developmentReact;

module.exports = require(reactPath);
