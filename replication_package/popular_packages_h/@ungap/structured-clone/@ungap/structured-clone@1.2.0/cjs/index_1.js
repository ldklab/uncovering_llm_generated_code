'use strict';
const { deserialize } = require('./deserialize.js');
const { serialize } = require('./serialize.js');

/**
 * @typedef {Array<string, any>} Record A representation of a record type
 */

/**
 * Returns an array of serialized Records.
 * @param {any} any - A serializable value.
 * @param {{ transfer?: any[]; json?: boolean; lossy?: boolean }?} options - An object with
 * a transfer option (ignored when polyfilled) and/or non-standard fields that
 * fallback to the polyfill if present.
 * @returns {Record[]}
 */
Object.defineProperty(exports, '__esModule', { value: true }).default = (function() {
  if (typeof structuredClone === 'function') {
    /* c8 ignore start */
    return (any, options) => {
      if (options && ('json' in options || 'lossy' in options)) {
        return deserialize(serialize(any, options));
      }
      return structuredClone(any);
    };
    /* c8 ignore stop */
  } else {
    return (any, options) => deserialize(serialize(any, options));
  }
})();

exports.deserialize = deserialize;
exports.serialize = serialize;
