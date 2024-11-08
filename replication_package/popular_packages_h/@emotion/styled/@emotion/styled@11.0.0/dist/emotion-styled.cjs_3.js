'use strict';

const isProduction = process.env.NODE_ENV === "production";
const modulePath = isProduction ? "./emotion-styled.cjs.prod.js" : "./emotion-styled.cjs.dev.js";
module.exports = require(modulePath);
