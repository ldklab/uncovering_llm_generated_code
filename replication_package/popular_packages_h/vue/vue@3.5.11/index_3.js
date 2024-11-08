'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const vuePath = isProduction ? './dist/vue.cjs.prod.js' : './dist/vue.cjs.js';
module.exports = require(vuePath);
