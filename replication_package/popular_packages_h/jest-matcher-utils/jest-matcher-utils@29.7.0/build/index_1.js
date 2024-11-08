'use strict';

import chalk from 'chalk';
import { diff, diffStringsUnified, diffStringsRaw, DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT } from 'jest-diff';
import { getType, isPrimitive } from 'jest-get-type';
import { format as prettyFormat, plugins as prettyPlugins } from 'pretty-format';
import Replaceable from './Replaceable';
import deepCyclicCopyReplaceable from './deepCyclicCopyReplaceable';

export const EXPECTED_COLOR = chalk.green;
export const RECEIVED_COLOR = chalk.red;
export const INVERTED_COLOR = chalk.inverse;
export const BOLD_WEIGHT = chalk.bold;
export const DIM_COLOR = chalk.dim;

const PLUGINS = [
  prettyPlugins.ReactTestComponent,
  prettyPlugins.ReactElement,
  prettyPlugins.DOMElement,
  prettyPlugins.DOMCollection,
  prettyPlugins.Immutable,
  prettyPlugins.AsymmetricMatcher
];

const MAX_DIFF_STRING_LENGTH = 20000;
const MULTILINE_REGEXP = /\n/;
const SPACE_SYMBOL = '\u{00B7}';

const stringify = (object, maxDepth = 10, maxWidth = 10) => {
  const MAX_LENGTH = 10000;
  let result;

  try {
    result = prettyFormat(object, { maxDepth, maxWidth, min: true, plugins: PLUGINS });
  } catch {
    result = prettyFormat(object, { callToJSON: false, maxDepth, maxWidth, min: true, plugins: PLUGINS });
  }

  if (result.length >= MAX_LENGTH) {
    return maxDepth > 1 ? stringify(object, Math.floor(maxDepth / 2), maxWidth) :
           maxWidth > 1 ? stringify(object, maxDepth, Math.floor(maxWidth / 2)) : result;
  }

  return result;
};

export function printWithType(name, value, print) {
  const type = getType(value);
  const hasType = type !== 'null' && type !== 'undefined' ? `${name} has type:  ${type}\n` : '';
  const hasValue = `${name} has value: ${print(value)}`;
  return hasType + hasValue;
}

export const highlightTrailingWhitespace = text => 
  text.replace(/\s+$/gm, chalk.inverse('$&'));
const replaceTrailingSpaces = text =>
  text.replace(/\s+$/gm, spaces => SPACE_SYMBOL.repeat(spaces.length));

export const printReceived = object =>
  RECEIVED_COLOR(replaceTrailingSpaces(stringify(object)));

export const printExpected = value =>
  EXPECTED_COLOR(replaceTrailingSpaces(stringify(value)));

export const ensureNoExpected = (expected, matcherName, options) => {
  if (typeof expected !== 'undefined') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, '', options),
      'this matcher must not have an expected argument',
      printWithType('Expected', expected, printExpected)
    ));
  }
};

export const ensureActualIsNumber = (actual, matcherName, options) => {
  if (typeof actual !== 'number' && typeof actual !== 'bigint') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${RECEIVED_COLOR('received')} value must be a number or bigint`,
      printWithType('Received', actual, printReceived)
    ));
  }
};

export const ensureExpectedIsNumber = (expected, matcherName, options) => {
  if (typeof expected !== 'number' && typeof expected !== 'bigint') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${EXPECTED_COLOR('expected')} value must be a number or bigint`,
      printWithType('Expected', expected, printExpected)
    ));
  }
};

export const ensureNumbers = (actual, expected, matcherName, options) => {
  ensureActualIsNumber(actual, matcherName, options);
  ensureExpectedIsNumber(expected, matcherName, options);
};

export const ensureExpectedIsNonNegativeInteger = (expected, matcherName, options) => {
  if (typeof expected !== 'number' || !Number.isSafeInteger(expected) || expected < 0) {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${EXPECTED_COLOR('expected')} value must be a non-negative integer`,
      printWithType('Expected', expected, printExpected)
    ));
  }
};

export const printDiffOrStringify = (expected, received, expectedLabel, receivedLabel, expand) => {
  if (typeof expected === 'string' && typeof received === 'string' && expectedLengthValid(expected) && receivedLengthValid(received) && expected !== received) {
    return handleStringDiff(expected, received, expectedLabel, receivedLabel, expand);
  }
  
  if (isLineDiffable(expected, received)) {
    const diffResult = handleGenericDiff(expected, received, expectedLabel, receivedLabel, expand);
    if (diffResult) return diffResult;
  }
  
  return fallbackDiffOrStringify(expected, received, expectedLabel, receivedLabel);
};

function expectedLengthValid(expected) {
  return expected.length !== 0 && expected.length <= MAX_DIFF_STRING_LENGTH;
}

function receivedLengthValid(received) {
  return received.length !== 0 && received.length <= MAX_DIFF_STRING_LENGTH;
}

function handleStringDiff(expected, received, expectedLabel, receivedLabel, expand) {
  if (expected.includes('\n') || received.includes('\n')) {
    return diffStringsUnified(expected, received, {
      aAnnotation: expectedLabel, 
      bAnnotation: receivedLabel, 
      changeLineTrailingSpaceColor: chalk.bgYellow, 
      commonLineTrailingSpaceColor: chalk.bgYellow, 
      emptyFirstOrLastLinePlaceholder: '↵', 
      expand, 
      includeChangeCounts: true
    });
  }
  
  const diffs = diffStringsRaw(expected, received, true);
  const hasCommonDiff = diffs.some(diff => diff[0] === DIFF_EQUAL);
  
  const expectedLine = printLabel(expectedLabel) + printExpected(getCommonAndChangedSubstrings(diffs, DIFF_DELETE, hasCommonDiff));
  const receivedLine = printLabel(receivedLabel) + printReceived(getCommonAndChangedSubstrings(diffs, DIFF_INSERT, hasCommonDiff));
  
  return `${expectedLine}\n${receivedLine}`;
}

function handleGenericDiff(expected, received, expectedLabel, receivedLabel, expand) {
  const { replacedExpected, replacedReceived } = replaceMatchedToAsymmetricMatcher(expected, received, [], []);
  const difference = diff(replacedExpected, replacedReceived, {
    aAnnotation: expectedLabel, 
    bAnnotation: receivedLabel, 
    expand, 
    includeChangeCounts: true
  });

  if (typeof difference === 'string' && difference.includes(`- ${expectedLabel}`) && difference.includes(`+ ${receivedLabel}`)) {
    return difference;
  }
}

function fallbackDiffOrStringify(expected, received, expectedLabel, receivedLabel) {
  const printLabel = getLabelPrinter(expectedLabel, receivedLabel);
  const expectedLine = printLabel(expectedLabel) + printExpected(expected);
  const receivedLine = printLabel(receivedLabel) + 
    (stringify(expected) === stringify(received) ? 'serializes to the same string' : printReceived(received));
  
  return `${expectedLine}\n${receivedLine}`;
}

function getCommonAndChangedSubstrings(diffs, op, hasCommonDiff) {
  return diffs.reduce((reduced, diff) => reduced + formatDiffSubstring(diff, op, hasCommonDiff), '');
}

function formatDiffSubstring(diff, op, hasCommonDiff) {
  return diff[0] === DIFF_EQUAL ? diff[1] : diff[0] !== op ? '' : hasCommonDiff ? INVERTED_COLOR(diff[1]) : diff[1];
}

function isLineDiffable(expected, received) {
  const expectedType = getType(expected);
  const receivedType = getType(received);

  if (expectedType !== receivedType) return false;
  if (isPrimitive(expected)) return isStringAndMultiline(expected, received);
  
  if (expectedType === 'date' || expectedType === 'function' || expectedType === 'regexp') return false;
  
  if (expected instanceof Error && received instanceof Error) return false;
  if (receivedType === 'object' && typeof received.asymmetricMatch === 'function') return false;

  return true;
}

function isStringAndMultiline(expected, received) {
  return typeof expected === 'string' && typeof received === 'string' && 
    expected.length !== 0 && received.length !== 0 &&
    (MULTILINE_REGEXP.test(expected) || MULTILINE_REGEXP.test(received));
}

function replaceMatchedToAsymmetricMatcher(replacedExpected, replacedReceived, expectedCycles, receivedCycles) {
  return _replaceMatchedToAsymmetricMatcher(
    deepCyclicCopyReplaceable(replacedExpected),
    deepCyclicCopyReplaceable(replacedReceived),
    expectedCycles, receivedCycles
  );
}

function _replaceMatchedToAsymmetricMatcher(replacedExpected, replacedReceived, expectedCycles, receivedCycles) {
  if (!Replaceable.isReplaceable(replacedExpected, replacedReceived)) return { replacedExpected, replacedReceived };
  
  if (expectedCycles.includes(replacedExpected) || receivedCycles.includes(replacedReceived)) return { replacedExpected, replacedReceived };
  
  expectedCycles.push(replacedExpected);
  receivedCycles.push(replacedReceived);
  
  const expectedReplaceable = new Replaceable(replacedExpected);
  const receivedReplaceable = new Replaceable(replacedReceived);
  
  expectedReplaceable.forEach((expectedValue, key) => {
    const receivedValue = receivedReplaceable.get(key);
    handleAsymmetricMatcher(expectedValue, receivedValue, key, expectedReplaceable, receivedReplaceable);
  });
  
  return { replacedExpected: expectedReplaceable.object, replacedReceived: receivedReplaceable.object };
}

function handleAsymmetricMatcher(expectedValue, receivedValue, key, expectedReplaceable, receivedReplaceable) {
  if (isAsymmetricMatcher(expectedValue) && expectedValue.asymmetricMatch(receivedValue)) {
    receivedReplaceable.set(key, expectedValue);
  } else if (isAsymmetricMatcher(receivedValue) && receivedValue.asymmetricMatch(expectedValue)) {
    expectedReplaceable.set(key, receivedValue);
  } else if (Replaceable.isReplaceable(expectedValue, receivedValue)) {
    const replaced = _replaceMatchedToAsymmetricMatcher(expectedValue, receivedValue, expectedCycles, receivedCycles);
    expectedReplaceable.set(key, replaced.replacedExpected);
    receivedReplaceable.set(key, replaced.replacedReceived);
  }
}

function isAsymmetricMatcher(data) {
  return getType(data) === 'object' && typeof data.asymmetricMatch === 'function';
}

export const diff = (a, b, options) =>
  shouldPrintDiff(a, b) ? diff(a, b, options) : null;

export const pluralize = (word, count) =>
  `${NUMBERS[count] || count} ${word}${count === 1 ? '' : 's'}`;

export const getLabelPrinter = (...strings) => {
  const maxLength = strings.reduce((max, string) => (string.length > max ? string.length : max), 0);
  return string => `${string}: ${' '.repeat(maxLength - string.length)}`;
};

export const matcherErrorMessage = (hint, generic, specific) =>
  `${hint}\n\n${BOLD_WEIGHT('Matcher error')}: ${generic}${specific ? `\n\n${specific}` : ''}`;

export const matcherHint = (matcherName, received = 'received', expected = 'expected', options = {}) => {
  const {
    comment = '',
    expectedColor = EXPECTED_COLOR,
    isDirectExpectCall = false,
    isNot = false,
    promise = '',
    receivedColor = RECEIVED_COLOR,
    secondArgument = '',
    secondArgumentColor = EXPECTED_COLOR
  } = options;

  let hint = '';
  let dimString = 'expect';

  if (!isDirectExpectCall && received !== '') {
    hint += DIM_COLOR(`${dimString}(`) + receivedColor(received);
    dimString = ')';
  }

  if (promise !== '') {
    hint += DIM_COLOR(`${dimString}.`) + promise;
    dimString = '';
  }

  if (isNot) {
    hint += `${DIM_COLOR(`${dimString}.`)}not`;
    dimString = '';
  }

  if (matcherName.includes('.')) {
    dimString += matcherName;
  } else {
    hint += DIM_COLOR(`${dimString}.`) + matcherName;
    dimString = '';
  }

  if (expected === '') {
    dimString += '()';
  } else {
    hint += DIM_COLOR(`${dimString}(`) + expectedColor(expected);
    if (secondArgument) {
      hint += DIM_COLOR(', ') + secondArgumentColor(secondArgument);
    }
    dimString = ')';
  }

  if (comment !== '') {
    dimString += ` // ${comment}`;
  }

  if (dimString !== '') {
    hint += DIM_COLOR(dimString);
  }

  return hint;
};
