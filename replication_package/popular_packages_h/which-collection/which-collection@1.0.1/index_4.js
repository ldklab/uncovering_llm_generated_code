'use strict';

const isMap = require('is-map');
const isSet = require('is-set');
const isWeakMap = require('is-weakmap');
const isWeakSet = require('is-weakset');

function whichCollection(value) {
  if (value && typeof value === 'object') {
    if (isMap(value)) return 'Map';
    if (isSet(value)) return 'Set';
    if (isWeakMap(value)) return 'WeakMap';
    if (isWeakSet(value)) return 'WeakSet';
  }
  return false;
}

module.exports = whichCollection;
