const lib = require('./nopt-lib');
const defaultTypeDefs = require('./type-defs');

// The `nopt` function and `clean` function from this module use a shared singleton pattern.
// The module allows setting `typeDefs` and `invalidHandler` properties on the `nopt` object.
// A more flexible API that doesn't rely on this pattern is available in `nopt-lib.js`.

module.exports = nopt;
nopt.clean = clean;
nopt.typeDefs = defaultTypeDefs;
nopt.lib = lib;

function nopt(types, shorthands, args = process.argv, slice = 2) {
  // Calls the `lib.nopt` function, slicing the `args` and passing additional configurations.
  const options = {
    types: types || {},
    shorthands: shorthands || {},
    typeDefs: nopt.typeDefs,
    invalidHandler: nopt.invalidHandler,
  };
  return lib.nopt(args.slice(slice), options);
}

function clean(data, types, typeDefs = nopt.typeDefs) {
  // Calls the `lib.clean` function with given data, types and optionally overridden typeDefs.
  const options = {
    types: types || {},
    typeDefs,
    invalidHandler: nopt.invalidHandler,
  };
  return lib.clean(data, options);
}
