'use strict';

/* eslint-env node */

// This code exports the appropriate build of React Router based on the environment.
// If the environment is set to production, it exports the minified production version.
// Otherwise, it exports the development version with more detailed debugging info.

const isProduction = process.env.NODE_ENV === "production";
const reactRouterPath = isProduction
  ? "./umd/react-router.production.min.js"
  : "./umd/react-router.development.js";

module.exports = require(reactRouterPath);
