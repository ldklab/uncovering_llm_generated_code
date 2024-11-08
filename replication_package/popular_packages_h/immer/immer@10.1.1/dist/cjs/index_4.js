'use strict';

const production = process.env.NODE_ENV === 'production';
const modulePath = production ? './immer.cjs.production.js' : './immer.cjs.development.js';

module.exports = require(modulePath);
