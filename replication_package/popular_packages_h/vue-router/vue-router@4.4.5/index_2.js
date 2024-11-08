'use strict';

const isProductionEnvironment = process.env.NODE_ENV === 'production';

const pathToModule = isProductionEnvironment
  ? './dist/vue-router.prod.cjs'
  : './dist/vue-router.cjs';

module.exports = require(pathToModule);
