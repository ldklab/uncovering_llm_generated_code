const lib = require('./nopt-lib');
const defaultTypeDefs = require('./type-defs');

// This module serves as a singleton API to handle command-line argument parsing using `nopt-lib`. 
// It incorporates external type definitions and an invalid argument handler as well.
// A more flexible API without singleton restrictions is available in `nopt-lib.js`.

// Export the nopt function and associated utility functions
module.exports = exports = nopt;
exports.clean = clean;
exports.typeDefs = defaultTypeDefs;
exports.lib = lib;

/**
 * Parse command-line arguments with defined types and shorthands.
 * 
 * @param {Object} types - An object defining the expected argument types.
 * @param {Object} shorthands - An object providing shorthand notations for arguments.
 * @param {Array} args - The array of command-line arguments to be parsed. Defaults to process.argv.
 * @param {Number} slice - The index to start slicing the args array from, typically to ignore 'node' and 'script'.
 * @returns {Object} - Parsed arguments mapped to their long forms with values.
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
 * Cleans the provided data object based on the defined types and type definitions.
 * 
 * @param {Object} data - The data to be cleaned.
 * @param {Object} types - An object defining the types for cleaning the data.
 * @param {Object} typeDefs - The type definitions used to validate the data.
 * @returns {Object} - The cleaned data object.
 */
function clean(data, types, typeDefs = exports.typeDefs) {
  return lib.clean(data, {
    types: types || {},
    typeDefs,
    invalidHandler: exports.invalidHandler,
  });
}
