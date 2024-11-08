'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const {
  DIFF_DELETE,
  DIFF_EQUAL,
  DIFF_INSERT,
  Diff
} = require('./cleanupSemantic');
const {
  diffLinesRaw,
  diffLinesUnified,
  diffLinesUnified2
} = require('./diffLines');
const {
  diffStringsRaw,
  diffStringsUnified 
} = require('./printDiffs');
const chalk = require('chalk').default;
const { getType } = require('jest-get-type');
const prettyFormat = require('pretty-format');
const { normalizeDiffOptions } = require('./normalizeDiffOptions');
const { NO_DIFF_MESSAGE, SIMILAR_MESSAGE } = require('./constants');

exports.DIFF_DELETE = DIFF_DELETE;
exports.DIFF_EQUAL = DIFF_EQUAL;
exports.DIFF_INSERT = DIFF_INSERT;
exports.Diff = Diff;
exports.diff = diff;
exports.diffLinesRaw = diffLinesRaw;
exports.diffLinesUnified = diffLinesUnified;
exports.diffLinesUnified2 = diffLinesUnified2;
exports.diffStringsRaw = diffStringsRaw;
exports.diffStringsUnified = diffStringsUnified;

const Symbol = globalThis['jest-symbol-do-not-touch'] || globalThis.Symbol;

const getCommonMessage = (message, options) => {
  const { commonColor } = normalizeDiffOptions(options);
  return commonColor(message);
};

const {
  AsymmetricMatcher,
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent
} = prettyFormat.plugins;

const PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher
];

const FORMAT_OPTIONS = {
  plugins: PLUGINS
};

const FALLBACK_FORMAT_OPTIONS = {
  callToJSON: false,
  maxDepth: 10,
  plugins: PLUGINS
};

function diff(a, b, options) {
  if (Object.is(a, b)) {
    return getCommonMessage(NO_DIFF_MESSAGE, options);
  }
  
  const aType = getType(a);
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

  if (expectedType !== getType(b)) {
    return (
      `  Comparing two different types of values. ` +
      `Expected ${chalk.green(expectedType)} but ` +
      `received ${chalk.red(getType(b))}.`
    );
  }

  if (omitDifference) {
    return null;
  }

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
  const aFormat = prettyFormat.format(a, FORMAT_OPTIONS);
  const bFormat = prettyFormat.format(b, FORMAT_OPTIONS);
  return aFormat === bFormat 
    ? getCommonMessage(NO_DIFF_MESSAGE, options)
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
  let hasThrown = false;

  try {
    const formatOptions = getFormatOptions(FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a, b, formatOptions, options);
  } catch {
    hasThrown = true;
  }

  const noDiffMessage = getCommonMessage(NO_DIFF_MESSAGE, options);

  if (difference === undefined || difference === noDiffMessage) {
    const formatOptions = getFormatOptions(FALLBACK_FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a, b, formatOptions, options);

    if (difference !== noDiffMessage && !hasThrown) {
      difference = `${getCommonMessage(SIMILAR_MESSAGE, options)}\n\n${difference}`;
    }
  }

  return difference;
}

function getFormatOptions(formatOptions, options) {
  const { compareKeys } = normalizeDiffOptions(options);
  return { ...formatOptions, compareKeys };
}

function getObjectsDifference(a, b, formatOptions, options) {
  const formatOptionsZeroIndent = { ...formatOptions, indent: 0 };
  const aCompare = prettyFormat.format(a, formatOptionsZeroIndent);
  const bCompare = prettyFormat.format(b, formatOptionsZeroIndent);

  if (aCompare === bCompare) {
    return getCommonMessage(NO_DIFF_MESSAGE, options);
  } else {
    const aDisplay = prettyFormat.format(a, formatOptions);
    const bDisplay = prettyFormat.format(b, formatOptions);
    return diffLinesUnified2(
      aDisplay.split('\n'),
      bDisplay.split('\n'),
      aCompare.split('\n'),
      bCompare.split('\n'),
      options
    );
  }
}
