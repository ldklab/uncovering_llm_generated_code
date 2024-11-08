const lib = require('./nopt-lib');
const defaultTypeDefs = require('./type-defs');

module.exports = {
  nopt,
  clean,
  typeDefs: defaultTypeDefs,
  lib,
};

function nopt(types = {}, shorthands = {}, args = process.argv, slice = 2) {
  const options = {
    types,
    shorthands,
    typeDefs: module.exports.typeDefs,
    invalidHandler: module.exports.invalidHandler,
  };
  return lib.nopt(args.slice(slice), options);
}

function clean(data, types = {}, typeDefs = module.exports.typeDefs) {
  const options = {
    types,
    typeDefs,
    invalidHandler: module.exports.invalidHandler,
  };
  return lib.clean(data, options);
}
