const lib = require('./nopt-lib');
const defaultTypeDefs = require('./type-defs');

// This module exports Nopt's API that works with a singleton pattern.
// Users need to set `typeDefs` and `invalidHandler` on the exported `nopt` object.
// A more encapsulated, non-singleton API is also available in `nopt-lib.js`.

module.exports = exports = nopt;
exports.clean = clean;
exports.typeDefs = defaultTypeDefs;
exports.lib = lib;

/**
 * Parses command-line arguments.
 * 
 * @param {Object} types - The expected types of received options.
 * @param {Object} shorthands - Shorthand options mapping.
 * @param {string[]} args - Argument list to parse, defaults to process.argv.
 * @param {number} slice - Index to slice `args`, defaults to 2.
 * 
 * @returns {Object} A parsed object containing arguments mapped to their values.
 */
function nopt(types, shorthands, args = process.argv, slice = 2) {
  return lib.nopt(args.slice(slice), {
    types: types || {},
    shorthands: shorthands || {},
    typeDefs: exports.typeDefs,
    invalidHandler: exports.invalidHandler,
  });
}

/**
 * Cleans the provided data based on types and type definitions.
 * 
 * @param {Object} data - The data to clean.
 * @param {Object} types - The expected types for data properties.
 * @param {Object} typeDefs - Type definitions, defaults to global typeDefs.
 * 
 * @returns {Object} Cleaned data based on specified types.
 */
function clean(data, types, typeDefs = exports.typeDefs) {
  return lib.clean(data, {
    types: types || {},
    typeDefs,
    invalidHandler: exports.invalidHandler,
  });
}
