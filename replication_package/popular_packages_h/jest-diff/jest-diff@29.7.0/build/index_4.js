'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

const modules = {
  DIFF_DELETE: './cleanupSemantic',
  DIFF_EQUAL: './cleanupSemantic',
  DIFF_INSERT: './cleanupSemantic',
  Diff: './cleanupSemantic',
  diffLinesRaw: './diffLines',
  diffLinesUnified: './diffLines',
  diffLinesUnified2: './diffLines',
  diffStringsRaw: './printDiffs',
  diffStringsUnified: './printDiffs'
};

for (const [key, path] of Object.entries(modules)) {
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return require(path)[key];
    }
  });
}

const _chalk = require('chalk');
const _jestGetType = require('jest-get-type');
const _prettyFormat = require('pretty-format');
const _cleanupSemantic = require('./cleanupSemantic');
const _constants = require('./constants');
const _diffLines = require('./diffLines');
const _normalizeDiffOptions = require('./normalizeDiffOptions');
const _printDiffs = require('./printDiffs');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var Symbol = globalThis['jest-symbol-do-not-touch'] || globalThis.Symbol;

const getCommonMessage = (message, options) => {
  const {commonColor} = _normalizeDiffOptions.normalizeDiffOptions(options);
  return commonColor(message);
};

const {
  AsymmetricMatcher,
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent
} = _prettyFormat.plugins;

const PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher
];

const FORMAT_OPTIONS = { plugins: PLUGINS };
const FALLBACK_FORMAT_OPTIONS = {
  callToJSON: false,
  maxDepth: 10,
  plugins: PLUGINS
};

function diff(a, b, options) {
  if (Object.is(a, b)) {
    return getCommonMessage(_constants.NO_DIFF_MESSAGE, options);
  }

  const aType = _jestGetType.getType(a);
  let expectedType = aType;
  let omitDifference = false;

  if (aType === 'object' && typeof a.asymmetricMatch === 'function') {
    if (a.$$typeof !== Symbol.for('jest.asymmetricMatcher')) return null;
    if (typeof a.getExpectedType !== 'function') return null;

    expectedType = a.getExpectedType();
    omitDifference = expectedType === 'string';
  }

  if (expectedType !== _jestGetType.getType(b)) {
    return `  Comparing two different types of values. Expected ${_chalk.green(expectedType)} but received ${_chalk.red(_jestGetType.getType(b))}.`;
  }
  
  if (omitDifference) return null;

  switch (aType) {
    case 'string':
      return _diffLines.diffLinesUnified(a.split('\n'), b.split('\n'), options);
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
  const aFormat = _prettyFormat.format(a, FORMAT_OPTIONS);
  const bFormat = _prettyFormat.format(b, FORMAT_OPTIONS);
  return aFormat === bFormat
    ? getCommonMessage(_constants.NO_DIFF_MESSAGE, options)
    : _diffLines.diffLinesUnified(aFormat.split('\n'), bFormat.split('\n'), options);
}

function sortMap(map) {
  return new Map([...map.entries()].sort());
}

function sortSet(set) {
  return new Set([...set.values()].sort());
}

function compareObjects(a, b, options) {
  let difference;
  let hasThrown = false;

  try {
    const formatOptions = getFormatOptions(FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a, b, formatOptions, options);
  } catch {
    hasThrown = true;
  }

  const noDiffMessage = getCommonMessage(_constants.NO_DIFF_MESSAGE, options);
  if (difference === undefined || difference === noDiffMessage) {
    const formatOptions = getFormatOptions(FALLBACK_FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a, b, formatOptions, options);
    if (difference !== noDiffMessage && !hasThrown) {
      difference = `${getCommonMessage(_constants.SIMILAR_MESSAGE, options)}\n\n${difference}`;
    }
  }

  return difference;
}

function getFormatOptions(formatOptions, options) {
  const { compareKeys } = _normalizeDiffOptions.normalizeDiffOptions(options);
  return { ...formatOptions, compareKeys };
}

function getObjectsDifference(a, b, formatOptions, options) {
  const formatOptionsZeroIndent = { ...formatOptions, indent: 0 };
  const aCompare = _prettyFormat.format(a, formatOptionsZeroIndent);
  const bCompare = _prettyFormat.format(b, formatOptionsZeroIndent);

  if (aCompare === bCompare) {
    return getCommonMessage(_constants.NO_DIFF_MESSAGE, options);
  } else {
    const aDisplay = _prettyFormat.format(a, formatOptions);
    const bDisplay = _prettyFormat.format(b, formatOptions);
    return _diffLines.diffLinesUnified2(
      aDisplay.split('\n'), bDisplay.split('\n'),
      aCompare.split('\n'), bCompare.split('\n'),
      options
    );
  }
}

exports.diff = diff;
