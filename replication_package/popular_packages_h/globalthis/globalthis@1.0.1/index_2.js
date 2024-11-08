'use strict';

const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const polyfill = getPolyfill();

const getGlobal = () => polyfill;

defineProperties(getGlobal, {
    getPolyfill,
    implementation,
    shim
});

module.exports = getGlobal;
