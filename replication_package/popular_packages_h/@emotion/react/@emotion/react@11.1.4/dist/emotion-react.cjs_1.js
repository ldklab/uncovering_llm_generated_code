'use strict';

const env = process.env.NODE_ENV;
let modulePath;

// Determine the module path based on the environment
if (env === "production") {
  modulePath = "./emotion-react.cjs.prod.js";
} else {
  modulePath = "./emotion-react.cjs.dev.js";
}

// Export the appropriate module
module.exports = require(modulePath);
