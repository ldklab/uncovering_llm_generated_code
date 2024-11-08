'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const vueRouterPath = isProduction ? './dist/vue-router.prod.cjs' : './dist/vue-router.cjs';

module.exports = require(vueRouterPath);
