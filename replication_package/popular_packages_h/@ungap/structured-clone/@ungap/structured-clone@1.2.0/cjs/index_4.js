'use strict';
const { deserialize } = require('./deserialize.js');
const { serialize } = require('./serialize.js');

/**
 * @typedef {Array<string, any>} Record A type representation of records
 */

/**
 * Serialize and clone an object.
 * 
 * @param {any} any - A serializable value.
 * @param {{transfer?: any[], json?: boolean, lossy?: boolean}?} options
 *   An object with options which can affect serialization behavior.
 * 
 * @returns {Record[]} An array of serialized Records.
 */
function cloneObject(any, options) {
  if (typeof structuredClone === 'function') {
    /* c8 ignore start */
    if (options && ('json' in options || 'lossy' in options)) {
      return deserialize(serialize(any, options));
    }
    return structuredClone(any);
    /* c8 ignore stop */
  }
  return deserialize(serialize(any, options));
}

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = cloneObject;

exports.deserialize = deserialize;
exports.serialize = serialize;
