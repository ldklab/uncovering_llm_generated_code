const internalRe = require('./internal/re');
const constants = require('./internal/constants');
const identifiers = require('./internal/identifiers');
const classes = {
  SemVer: require('./classes/semver'),
  Comparator: require('./classes/comparator'),
  Range: require('./classes/range'),
};
const functions = {
  parse: require('./functions/parse'),
  valid: require('./functions/valid'),
  clean: require('./functions/clean'),
  inc: require('./functions/inc'),
  diff: require('./functions/diff'),
  major: require('./functions/major'),
  minor: require('./functions/minor'),
  patch: require('./functions/patch'),
  prerelease: require('./functions/prerelease'),
  compare: require('./functions/compare'),
  rcompare: require('./functions/rcompare'),
  compareLoose: require('./functions/compare-loose'),
  compareBuild: require('./functions/compare-build'),
  sort: require('./functions/sort'),
  rsort: require('./functions/rsort'),
  gt: require('./functions/gt'),
  lt: require('./functions/lt'),
  eq: require('./functions/eq'),
  neq: require('./functions/neq'),
  gte: require('./functions/gte'),
  lte: require('./functions/lte'),
  cmp: require('./functions/cmp'),
  coerce: require('./functions/coerce'),
  satisfies: require('./functions/satisfies'),
};

const ranges = {
  toComparators: require('./ranges/to-comparators'),
  maxSatisfying: require('./ranges/max-satisfying'),
  minSatisfying: require('./ranges/min-satisfying'),
  minVersion: require('./ranges/min-version'),
  validRange: require('./ranges/valid'),
  outside: require('./ranges/outside'),
  gtr: require('./ranges/gtr'),
  ltr: require('./ranges/ltr'),
  intersects: require('./ranges/intersects'),
  simplifyRange: require('./ranges/simplify'),
  subset: require('./ranges/subset'),
};

module.exports = {
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  ...classes,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers,
  ...functions,
  ...ranges,
};
