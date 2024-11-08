'use strict';
const { deserialize } = require('./deserialize.js');
const { serialize } = require('./serialize.js');

/**
 * @typedef {Array<string, any>} Record a type representation
 */

/**
 * Returns an array of serialized Records.
 * @param {any} any a serializable value.
 * @param {{transfer?: any[], json?: boolean, lossy?: boolean}?} options an object with
 * a transfer option (ignored when polyfilled) and/or non standard fields that
 * fallback to the polyfill if present.
 * @returns {Record[]}
 */
Object.defineProperty(exports, '__esModule', { value: true }).default = function(any, options) {
  const shouldStructuredClone = typeof structuredClone === "function" &&
    !(options && ('json' in options || 'lossy' in options));

  if (shouldStructuredClone) {
    return structuredClone(any);
  } else {
    return deserialize(serialize(any, options));
  }
};

exports.deserialize = deserialize;
exports.serialize = serialize;
