'use strict';

const env = process.env.NODE_ENV;
let modulePath;

if (env === 'production') {
  modulePath = './dist/vue.cjs.prod.js';
} else {
  modulePath = './dist/vue.cjs.js';
}

module.exports = require(modulePath);
