'use strict';

const environment = process.env.NODE_ENV;
const isProduction = environment === "production";

const productionModule = "./umd/react-router-dom.production.min.js";
const developmentModule = "./umd/react-router-dom.development.js";

const moduleToExport = isProduction ? productionModule : developmentModule;

module.exports = require(moduleToExport);
