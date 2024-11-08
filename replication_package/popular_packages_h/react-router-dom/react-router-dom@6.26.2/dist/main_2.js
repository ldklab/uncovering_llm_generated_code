'use strict';

/* eslint-env node */

const env = process.env.NODE_ENV;
const prodFile = "./umd/react-router-dom.production.min.js";
const devFile = "./umd/react-router-dom.development.js";

module.exports = require(env === "production" ? prodFile : devFile);
