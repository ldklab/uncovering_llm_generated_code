'use strict';

const prodPath = './dist/vue.cjs.prod.js';
const devPath = './dist/vue.cjs.js';

const isProduction = process.env.NODE_ENV === 'production';
module.exports = require(isProduction ? prodPath : devPath);
