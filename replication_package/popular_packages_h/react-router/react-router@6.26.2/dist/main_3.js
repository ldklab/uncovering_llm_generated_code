'use strict';

// Check whether the environment is set to production
if (process.env.NODE_ENV === "production") {
  // Export the production version of the module if in production environment
  module.exports = require("./umd/react-router.production.min.js");
} else {
  // Export the development version of the module if not in production environment
  module.exports = require("./umd/react-router.development.js");
}
