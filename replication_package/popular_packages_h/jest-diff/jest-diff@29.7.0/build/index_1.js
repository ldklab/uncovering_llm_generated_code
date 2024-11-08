'use strict';

import chalk from 'chalk';
import { getType } from 'jest-get-type';
import { format, plugins as prettyFormatPlugins } from 'pretty-format';
import * as _cleanupSemantic from './cleanupSemantic';
import { NO_DIFF_MESSAGE, SIMILAR_MESSAGE } from './constants';
import * as _diffLines from './diffLines';
import { normalizeDiffOptions } from './normalizeDiffOptions';
import * as _printDiffs from './printDiffs';

export const DIFF_DELETE = _cleanupSemantic.DIFF_DELETE;
export const DIFF_EQUAL = _cleanupSemantic.DIFF_EQUAL;
export const DIFF_INSERT = _cleanupSemantic.DIFF_INSERT;
export const Diff = _cleanupSemantic.Diff;

export const diff = computeDiff;
export const diffLinesRaw = _diffLines.diffLinesRaw;
export const diffLinesUnified = _diffLines.diffLinesUnified;
export const diffLinesUnified2 = _diffLines.diffLinesUnified2;
export const diffStringsRaw = _printDiffs.diffStringsRaw;
export const diffStringsUnified = _printDiffs.diffStringsUnified;

const Symbol = globalThis['jest-symbol-do-not-touch'] || globalThis.Symbol;

const getCommonMessage = (message, options) => {
  const { commonColor } = normalizeDiffOptions(options);
  return commonColor(message);
};

const PLUGINS = [
  prettyFormatPlugins.ReactTestComponent,
  prettyFormatPlugins.ReactElement,
  prettyFormatPlugins.DOMElement,
  prettyFormatPlugins.DOMCollection,
  prettyFormatPlugins.Immutable,
  prettyFormatPlugins.AsymmetricMatcher
];

const FORMAT_OPTIONS = { plugins: PLUGINS };
const FALLBACK_FORMAT_OPTIONS = { callToJSON: false, maxDepth: 10, plugins: PLUGINS };

function computeDiff(a, b, options) {
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
    return `  Comparing two different types of values. Expected ${chalk.green(expectedType)} but received ${chalk.red(getType(b))}.`;
  }

  if (omitDifference) return null;

  switch (aType) {
    case 'string':
      return _diffLines.diffLinesUnified(a.split('\n'), b.split('\n'), options);
    case 'boolean':
    case 'number':
      return comparePrimitive(a, b, options);
    case 'map':
      return compareObjects(sortCollection(new Map(a)), sortCollection(new Map(b)), options);
    case 'set':
      return compareObjects(sortCollection(new Set(a)), sortCollection(new Set(b)), options);
    default:
      return compareObjects(a, b, options);
  }
}

function comparePrimitive(a, b, options) {
  const aFormat = format(a, FORMAT_OPTIONS);
  const bFormat = format(b, FORMAT_OPTIONS);

  return aFormat === bFormat
    ? getCommonMessage(NO_DIFF_MESSAGE, options)
    : _diffLines.diffLinesUnified(aFormat.split('\n'), bFormat.split('\n'), options);
}

function sortCollection(collection) {
  return Array.from(collection.entries() || collection.values()).sort();
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

  if (!difference || difference === noDiffMessage) {
    const formatOptions = getFormatOptions(FALLBACK_FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a, b, formatOptions, options);

    if (difference !== noDiffMessage && !hasThrown) {
      difference = getCommonMessage(SIMILAR_MESSAGE, options) + '\n\n' + difference;
    }
  }

  return difference;
}

function getFormatOptions(formatOptions, { compareKeys }) {
  return { ...formatOptions, compareKeys };
}

function getObjectsDifference(a, b, formatOptions, options) {
  const zeroIndentFormatOptions = { ...formatOptions, indent: 0 };

  const aCompare = format(a, zeroIndentFormatOptions);
  const bCompare = format(b, zeroIndentFormatOptions);

  if (aCompare === bCompare) {
    return getCommonMessage(NO_DIFF_MESSAGE, options);
  } else {
    const aDisplay = format(a, formatOptions);
    const bDisplay = format(b, formatOptions);
    return _diffLines.diffLinesUnified2(aDisplay.split('\n'), bDisplay.split('\n'), aCompare.split('\n'), bCompare.split('\n'), options);
  }
}
