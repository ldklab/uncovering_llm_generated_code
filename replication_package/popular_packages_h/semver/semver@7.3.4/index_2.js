// Import required modules and components
const { re, src, t: tokens } = require('./internal/re');
const { SEMVER_SPEC_VERSION } = require('./internal/constants');
const { compareIdentifiers, rcompareIdentifiers } = require('./internal/identifiers');

const SemVer = require('./classes/semver');
const Comparator = require('./classes/comparator');
const Range = require('./classes/range');

const parse = require('./functions/parse');
const valid = require('./functions/valid');
const clean = require('./functions/clean');
const inc = require('./functions/inc');
const diff = require('./functions/diff');
const major = require('./functions/major');
const minor = require('./functions/minor');
const patch = require('./functions/patch');
const prerelease = require('./functions/prerelease');
const compare = require('./functions/compare');
const rcompare = require('./functions/rcompare');
const compareLoose = require('./functions/compare-loose');
const compareBuild = require('./functions/compare-build');
const sort = require('./functions/sort');
const rsort = require('./functions/rsort');
const gt = require('./functions/gt');
const lt = require('./functions/lt');
const eq = require('./functions/eq');
const neq = require('./functions/neq');
const gte = require('./functions/gte');
const lte = require('./functions/lte');
const cmp = require('./functions/cmp');
const coerce = require('./functions/coerce');

const satisfies = require('./functions/satisfies');
const toComparators = require('./ranges/to-comparators');
const maxSatisfying = require('./ranges/max-satisfying');
const minSatisfying = require('./ranges/min-satisfying');
const minVersion = require('./ranges/min-version');
const validRange = require('./ranges/valid');
const outside = require('./ranges/outside');
const gtr = require('./ranges/gtr');
const ltr = require('./ranges/ltr');
const intersects = require('./ranges/intersects');
const simplifyRange = require('./ranges/simplify');
const subset = require('./ranges/subset');

// Export the imported modules and functions
module.exports = {
  re,
  src,
  tokens,
  SEMVER_SPEC_VERSION,
  SemVer,
  compareIdentifiers,
  rcompareIdentifiers,
  parse,
  valid,
  clean,
  inc,
  diff,
  major,
  minor,
  patch,
  prerelease,
  compare,
  rcompare,
  compareLoose,
  compareBuild,
  sort,
  rsort,
  gt,
  lt,
  eq,
  neq,
  gte,
  lte,
  cmp,
  coerce,
  Comparator,
  Range,
  satisfies,
  toComparators,
  maxSatisfying,
  minSatisfying,
  minVersion,
  validRange,
  outside,
  gtr,
  ltr,
  intersects,
  simplifyRange,
  subset,
};