'use strict';

/* eslint-env node */

const environment = process.env.NODE_ENV;

if (environment === "production") {
  module.exports = require("./umd/react-router.production.min.js");
} else {
  module.exports = require("./umd/react-router.development.js");
}
