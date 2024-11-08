'use strict';

const isProduction = process.env.NODE_ENV === "production";
const libraryPath = isProduction
  ? "./umd/react-router-dom.production.min.js"
  : "./umd/react-router-dom.development.js";

module.exports = require(libraryPath);
