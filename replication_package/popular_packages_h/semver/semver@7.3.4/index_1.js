// Load internal dependency modules
const internalRe = require('./internal/re');
const constants = require('./internal/constants');
const identifierFunctions = require('./internal/identifiers');
const semverClass = require('./classes/semver');
const comparatorClass = require('./classes/comparator');
const rangeClass = require('./classes/range');

// Load functions
const parseFunction = require('./functions/parse');
const validFunction = require('./functions/valid');
const cleanFunction = require('./functions/clean');
const incFunction = require('./functions/inc');
const diffFunction = require('./functions/diff');
const majorFunction = require('./functions/major');
const minorFunction = require('./functions/minor');
const patchFunction = require('./functions/patch');
const prereleaseFunction = require('./functions/prerelease');
const compareFunction = require('./functions/compare');
const rcompareFunction = require('./functions/rcompare');
const compareLooseFunction = require('./functions/compare-loose');
const compareBuildFunction = require('./functions/compare-build');
const sortFunction = require('./functions/sort');
const rsortFunction = require('./functions/rsort');
const gtFunction = require('./functions/gt');
const ltFunction = require('./functions/lt');
const eqFunction = require('./functions/eq');
const neqFunction = require('./functions/neq');
const gteFunction = require('./functions/gte');
const lteFunction = require('./functions/lte');
const cmpFunction = require('./functions/cmp');
const coerceFunction = require('./functions/coerce');

// Load range functions
const satisfiesFunction = require('./functions/satisfies');
const toComparatorsFunction = require('./ranges/to-comparators');
const maxSatisfyingFunction = require('./ranges/max-satisfying');
const minSatisfyingFunction = require('./ranges/min-satisfying');
const minVersionFunction = require('./ranges/min-version');
const validRangeFunction = require('./ranges/valid');
const outsideFunction = require('./ranges/outside');
const gtrFunction = require('./ranges/gtr');
const ltrFunction = require('./ranges/ltr');
const intersectsFunction = require('./ranges/intersects');
const simplifyRangeFunction = require('./ranges/simplify');
const subsetFunction = require('./ranges/subset');

// Export as module
module.exports = {
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  SemVer: semverClass,
  compareIdentifiers: identifierFunctions.compareIdentifiers,
  rcompareIdentifiers: identifierFunctions.rcompareIdentifiers,
  parse: parseFunction,
  valid: validFunction,
  clean: cleanFunction,
  inc: incFunction,
  diff: diffFunction,
  major: majorFunction,
  minor: minorFunction,
  patch: patchFunction,
  prerelease: prereleaseFunction,
  compare: compareFunction,
  rcompare: rcompareFunction,
  compareLoose: compareLooseFunction,
  compareBuild: compareBuildFunction,
  sort: sortFunction,
  rsort: rsortFunction,
  gt: gtFunction,
  lt: ltFunction,
  eq: eqFunction,
  neq: neqFunction,
  gte: gteFunction,
  lte: lteFunction,
  cmp: cmpFunction,
  coerce: coerceFunction,
  Comparator: comparatorClass,
  Range: rangeClass,
  satisfies: satisfiesFunction,
  toComparators: toComparatorsFunction,
  maxSatisfying: maxSatisfyingFunction,
  minSatisfying: minSatisfyingFunction,
  minVersion: minVersionFunction,
  validRange: validRangeFunction,
  outside: outsideFunction,
  gtr: gtrFunction,
  ltr: ltrFunction,
  intersects: intersectsFunction,
  simplifyRange: simplifyRangeFunction,
  subset: subsetFunction,
};
