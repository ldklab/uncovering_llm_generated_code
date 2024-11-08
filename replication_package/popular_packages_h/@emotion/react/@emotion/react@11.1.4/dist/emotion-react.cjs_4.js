'use strict';

const env = process.env.NODE_ENV;
const moduleToExport = env === "production" 
  ? "./emotion-react.cjs.prod.js" 
  : "./emotion-react.cjs.dev.js";

module.exports = require(moduleToExport);
