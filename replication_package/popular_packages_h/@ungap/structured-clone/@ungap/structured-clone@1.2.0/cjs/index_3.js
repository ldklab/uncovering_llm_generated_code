'use strict';
const { deserialize } = require('./deserialize.js');
const { serialize } = require('./serialize.js');

/**
 * @typedef {Array<string, any>} Record a type representation
 */

/**
 * Returns an array of serialized Records.
 * @param {any} value a serializable value.
 * @param {{transfer?: any[], json?: boolean, lossy?: boolean}?} options an object with
 * a transfer option (ignored when polyfilled) and/or non standard fields.
 * @returns {Record[]}
 */
function cloneValue(value, options) {
  if (typeof structuredClone === "function") {
    if (options && ('json' in options || 'lossy' in options)) {
      return deserialize(serialize(value, options));
    }
    return structuredClone(value);
  } else {
    return deserialize(serialize(value, options));
  }
}

Object.defineProperty(exports, '__esModule', { value: true }).default = cloneValue;
exports.deserialize = deserialize;
exports.serialize = serialize;
