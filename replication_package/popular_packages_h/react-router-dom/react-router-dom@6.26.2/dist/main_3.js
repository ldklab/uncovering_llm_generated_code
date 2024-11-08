'use strict';

// This code is a conditional export mechanism for a Node.js module. 
// It checks the Node environment variable `NODE_ENV` to determine 
// which version of the `react-router-dom` module to export. 
// If the environment is set to "production", it exports the minified 
// production build. Otherwise, it exports the development build.

const isProduction = process.env.NODE_ENV === "production";
const productionPath = "./umd/react-router-dom.production.min.js";
const developmentPath = "./umd/react-router-dom.development.js";

module.exports = isProduction ? require(productionPath) : require(developmentPath);
