'use strict';

const isProduction = process.env.NODE_ENV === "production";
const modulePath = isProduction ? "./emotion-react.cjs.prod.js" : "./emotion-react.cjs.dev.js";

module.exports = require(modulePath);
