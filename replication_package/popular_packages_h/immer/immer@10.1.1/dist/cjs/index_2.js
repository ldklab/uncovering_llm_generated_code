'use strict';

const immerModule = process.env.NODE_ENV === 'production'
  ? './immer.cjs.production.js'
  : './immer.cjs.development.js';

module.exports = require(immerModule);
