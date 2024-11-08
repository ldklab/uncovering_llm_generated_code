'use strict'

const environment = process.env.NODE_ENV;

const vueRouterModule = environment === 'production' ? 
  './dist/vue-router.prod.cjs' : 
  './dist/vue-router.cjs';

module.exports = require(vueRouterModule);
