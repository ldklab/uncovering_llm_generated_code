'use strict';

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';
const routerPath = isProduction ? './umd/react-router.production.min.js' : './umd/react-router.development.js';

module.exports = require(routerPath);
