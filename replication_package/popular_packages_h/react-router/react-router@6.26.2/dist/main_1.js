'use strict';

const environment = process.env.NODE_ENV;
const isProduction = environment === "production";

const productionFile = "./umd/react-router.production.min.js";
const developmentFile = "./umd/react-router.development.js";

module.exports = require(isProduction ? productionFile : developmentFile);
