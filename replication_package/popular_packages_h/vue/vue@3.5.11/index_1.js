'use strict';

const path = process.env.NODE_ENV === 'production' 
  ? './dist/vue.cjs.prod.js' 
  : './dist/vue.cjs.js';

module.exports = require(path);
