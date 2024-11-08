js
const internalRe = require('./internal/re');
const constants = require('./internal/constants');
const SemVer = require('./classes/semver');
const identifiers = require('./internal/identifiers');

const {
  parse, valid, clean, inc, diff, major, minor, patch,
  prerelease, compare, rcompare, compareLoose, compareBuild,
  sort, rsort, gt, lt, eq, neq, gte, lte, cmp, coerce
} = require('./functions');

const Comparator = require('./classes/comparator');
const Range = require('./classes/range');

const {
  satisfies, toComparators, maxSatisfying, minSatisfying, minVersion,
  validRange, outside, gtr, ltr, intersects, simplifyRange, subset
} = require('./ranges');

module.exports = {
  parse, valid, clean, inc, diff, major, minor, patch,
  prerelease, compare, rcompare, compareLoose, compareBuild,
  sort, rsort, gt, lt, eq, neq, gte, lte, cmp, coerce,
  Comparator, Range, satisfies, toComparators, maxSatisfying,
  minSatisfying, minVersion, validRange, outside, gtr, ltr,
  intersects, simplifyRange, subset, SemVer,
  re: internalRe.re, src: internalRe.src, tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: constants.RELEASE_TYPES,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers,
};
