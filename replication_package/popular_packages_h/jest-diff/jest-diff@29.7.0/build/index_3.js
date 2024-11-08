'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperty(exports, 'DIFF_DELETE', {
  enumerable: true, get: () => _cleanupSemantic.DIFF_DELETE
});
Object.defineProperty(exports, 'DIFF_EQUAL', {
  enumerable: true, get: () => _cleanupSemantic.DIFF_EQUAL
});
Object.defineProperty(exports, 'DIFF_INSERT', {
  enumerable: true, get: () => _cleanupSemantic.DIFF_INSERT
});
Object.defineProperty(exports, 'Diff', {
  enumerable: true, get: () => _cleanupSemantic.Diff
});
exports.diff = diff;
Object.defineProperty(exports, 'diffLinesRaw', {
  enumerable: true, get: () => _diffLines.diffLinesRaw
});
Object.defineProperty(exports, 'diffLinesUnified', {
  enumerable: true, get: () => _diffLines.diffLinesUnified
});
Object.defineProperty(exports, 'diffLinesUnified2', {
  enumerable: true, get: () => _diffLines.diffLinesUnified2
});
Object.defineProperty(exports, 'diffStringsRaw', {
  enumerable: true, get: () => _printDiffs.diffStringsRaw
});
Object.defineProperty(exports, 'diffStringsUnified', {
  enumerable: true, get: () => _printDiffs.diffStringsUnified
});

const _chalk = require('chalk').default;
const _jestGetType = require('jest-get-type');
const _prettyFormat = require('pretty-format');
const _cleanupSemantic = require('./cleanupSemantic');
const _constants = require('./constants');
const _diffLines = require('./diffLines');
const _normalizeDiffOptions = require('./normalizeDiffOptions');
const _printDiffs = require('./printDiffs');

const Symbol = globalThis['jest-symbol-do-not-touch'] || globalThis.Symbol;

// Function to get common message with specified color
const getCommonMessage = (message, options) => {
  const { commonColor } = _normalizeDiffOptions.normalizeDiffOptions(options);
  return commonColor(message);
};

const {
  AsymmetricMatcher, DOMCollection, DOMElement, Immutable,
  ReactElement, ReactTestComponent
} = _prettyFormat.plugins;

const PLUGINS = [
  ReactTestComponent, ReactElement, DOMElement,
  DOMCollection, Immutable, AsymmetricMatcher
];

const FORMAT_OPTIONS = { plugins: PLUGINS };
const FALLBACK_FORMAT_OPTIONS = {
  callToJSON: false, maxDepth: 10, plugins: PLUGINS
};

// Function to handle diffing of two values with various checks
function diff(a, b, options) {
  if (Object.is(a, b)) {
    return getCommonMessage(_constants.NO_DIFF_MESSAGE, options);
  }
  const aType = _jestGetType.getType(a);
  let expectedType = aType;
  let omitDifference = false;

  if (aType === 'object' && typeof a.asymmetricMatch === 'function') {
    if (a.$$typeof !== Symbol.for('jest.asymmetricMatcher')) {
      return null;
    }
    if (typeof a.getExpectedType !== 'function') {
      return null;
    }
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

// Function to compare primitives
function comparePrimitive(a, b, options) {
  const aFormat = _prettyFormat.format(a, FORMAT_OPTIONS);
  const bFormat = _prettyFormat.format(b, FORMAT_OPTIONS);
  return aFormat === bFormat ? getCommonMessage(_constants.NO_DIFF_MESSAGE, options) :
         _diffLines.diffLinesUnified(aFormat.split('\n'), bFormat.split('\n'), options);
}

// Helper functions to sort maps and sets for comparison
function sortMap(map) {
  return new Map(Array.from(map.entries()).sort());
}
function sortSet(set) {
  return new Set(Array.from(set.values()).sort());
}

// Function to compare objects
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

// Function to get format options based on provided options
function getFormatOptions(formatOptions, options) {
  const { compareKeys } = _normalizeDiffOptions.normalizeDiffOptions(options);
  return { ...formatOptions, compareKeys };
}

// Function to obtain differences in objects
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
