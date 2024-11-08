'use strict';

const whichTypedArray = require('which-typed-array');

/** @type {import('.')} */
module.exports = function isTypedArray(value) {
  return Boolean(whichTypedArray(value));
};
