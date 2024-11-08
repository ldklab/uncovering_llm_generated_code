'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

const { DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT, Diff } = require('./cleanupSemantic');
const { diffLinesRaw, diffLinesUnified, diffLinesUnified2 } = require('./diffLines');
const { diffStringsRaw, diffStringsUnified } = require('./printDiffs');

exports.DIFF_DELETE = DIFF_DELETE;
exports.DIFF_EQUAL = DIFF_EQUAL;
exports.DIFF_INSERT = DIFF_INSERT;
exports.Diff = Diff;
exports.diffLinesRaw = diffLinesRaw;
exports.diffLinesUnified = diffLinesUnified;
exports.diffLinesUnified2 = diffLinesUnified2;
exports.diffStringsRaw = diffStringsRaw;
exports.diffStringsUnified = diffStringsUnified;

const _chalk = require('chalk');
const _jestGetType = require('jest-get-type');
const _prettyFormat = require('pretty-format');
const { normalizeDiffOptions } = require('./normalizeDiffOptions');
const _constants = require('./constants');

const PLUGINS = [
  _prettyFormat.plugins.ReactTestComponent,
  _prettyFormat.plugins.ReactElement,
  _prettyFormat.plugins.DOMElement,
  _prettyFormat.plugins.DOMCollection,
  _prettyFormat.plugins.Immutable,
  _prettyFormat.plugins.AsymmetricMatcher,
];

const FORMAT_OPTIONS = { plugins: PLUGINS };
const FORMAT_OPTIONS_0 = { ...FORMAT_OPTIONS, indent: 0 };
const FALLBACK_FORMAT_OPTIONS = { callToJSON: false, maxDepth: 10, plugins: PLUGINS };
const FALLBACK_FORMAT_OPTIONS_0 = { ...FALLBACK_FORMAT_OPTIONS, indent: 0 };

function getCommonMessage(message, options) {
  const { commonColor } = normalizeDiffOptions(options);
  return commonColor(message);
}

function diff(a, b, options) {
  if (Object.is(a, b)) return getCommonMessage(_constants.NO_DIFF_MESSAGE, options);

  const aType = _jestGetType(a);
  let expectedType = aType;
  let omitDifference = false;

  if (aType === 'object' && typeof a.asymmetricMatch === 'function' && a.$$typeof === Symbol.for('jest.asymmetricMatcher')) {
    expectedType = typeof a.getExpectedType === 'function' ? a.getExpectedType() : aType;
    omitDifference = expectedType === 'string';
  }

  if (expectedType !== _jestGetType(b)) {
    return `  Comparing two different types of values. Expected ${_chalk.green(expectedType)} but received ${_chalk.red(_jestGetType(b))}.`;
  }

  if (omitDifference) return null;

  switch (aType) {
    case 'string':
      return diffLinesUnified(a.split('\n'), b.split('\n'), options);

    case 'boolean':
    case 'number':
      return comparePrimitive(a, b, options);

    case 'map':
      return compareObjects(sortMap(a), sortMap(b), options);

    case 'set':
      return compareObjects(sortSet(a), sortSet(b), options);

    default:
      return compareObjects(a, b, options);
  }
}

function comparePrimitive(a, b, options) {
  const aFormat = _prettyFormat(a, FORMAT_OPTIONS);
  const bFormat = _prettyFormat(b, FORMAT_OPTIONS);
  return aFormat === bFormat
    ? getCommonMessage(_constants.NO_DIFF_MESSAGE, options)
    : diffLinesUnified(aFormat.split('\n'), bFormat.split('\n'), options);
}

function sortMap(map) {
  return new Map(Array.from(map.entries()).sort());
}

function sortSet(set) {
  return new Set(Array.from(set.values()).sort());
}

function compareObjects(a, b, options) {
  let difference;
  const noDiffMessage = getCommonMessage(_constants.NO_DIFF_MESSAGE, options);

  try {
    const aCompare = _prettyFormat(a, FORMAT_OPTIONS_0);
    const bCompare = _prettyFormat(b, FORMAT_OPTIONS_0);
    if (aCompare === bCompare) {
      difference = noDiffMessage;
    } else {
      const aDisplay = _prettyFormat(a, FORMAT_OPTIONS);
      const bDisplay = _prettyFormat(b, FORMAT_OPTIONS);
      difference = diffLinesUnified2(aDisplay.split('\n'), bDisplay.split('\n'), aCompare.split('\n'), bCompare.split('\n'), options);
    }
  } catch {
    // Error handling
  }

  if (difference === undefined || difference === noDiffMessage) {
    const aCompareFallback = _prettyFormat(a, FALLBACK_FORMAT_OPTIONS_0);
    const bCompareFallback = _prettyFormat(b, FALLBACK_FORMAT_OPTIONS_0);
    if (aCompareFallback === bCompareFallback) {
      difference = noDiffMessage;
    } else {
      const aDisplayFallback = _prettyFormat(a, FALLBACK_FORMAT_OPTIONS);
      const bDisplayFallback = _prettyFormat(b, FALLBACK_FORMAT_OPTIONS);
      difference = diffLinesUnified2(aDisplayFallback.split('\n'), bDisplayFallback.split('\n'), aCompareFallback.split('\n'), bCompareFallback.split('\n'), options);
      if (difference !== noDiffMessage) {
        difference = `${getCommonMessage(_constants.SIMILAR_MESSAGE, options)}\n\n${difference}`;
      }
    }
  }

  return difference;
}

exports.default = diff;
