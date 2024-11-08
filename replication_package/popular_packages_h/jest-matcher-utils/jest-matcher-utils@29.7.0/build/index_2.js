'use strict';

import chalk from 'chalk';
import { diff as jestDiff, DIFF_EQUAL, DIFF_INSERT, DIFF_DELETE } from 'jest-diff';
import { getType, isPrimitive } from 'jest-get-type';
import { format as prettyFormat } from 'pretty-format';
import Replaceable from './Replaceable';
import deepCyclicCopyReplaceable from './deepCyclicCopyReplaceable';

const {
  AsymmetricMatcher,
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent,
} = prettyFormat.plugins;

const PLUGINS = [
  ReactTestComponent, ReactElement, DOMElement, DOMCollection, Immutable, AsymmetricMatcher,
];

const EXPECTED_COLOR = chalk.green;
const RECEIVED_COLOR = chalk.red;
const INVERTED_COLOR = chalk.inverse;
const BOLD_WEIGHT = chalk.bold;
const DIM_COLOR = chalk.dim;
const SPACE_SYMBOL = '\u{00B7}';

const SUGGEST_TO_CONTAIN_EQUAL = chalk.dim(
  'Looks like you wanted to test for object/array equality with the stricter `toContain` matcher. You probably need to use `toContainEqual` instead.'
);

const stringify = (object, maxDepth = 10, maxWidth = 10) => {
  const MAX_LENGTH = 10000;
  let result;
  try {
    result = prettyFormat(object, { maxDepth, maxWidth, min: true, plugins: PLUGINS });
  } catch {
    result = prettyFormat(object, { callToJSON: false, maxDepth, maxWidth, min: true, plugins: PLUGINS });
  }
  if (result.length >= MAX_LENGTH && maxDepth > 1) {
    return stringify(object, Math.floor(maxDepth / 2), maxWidth);
  } else if (result.length >= MAX_LENGTH && maxWidth > 1) {
    return stringify(object, maxDepth, Math.floor(maxWidth / 2));
  }
  return result;
};

const highlightTrailingWhitespace = text => text.replace(/\s+$/gm, chalk.inverse('$&'));

const replaceTrailingSpaces = text => text.replace(/\s+$/gm, spaces => SPACE_SYMBOL.repeat(spaces.length));

const printReceived = object => RECEIVED_COLOR(replaceTrailingSpaces(stringify(object)));

const printExpected = value => EXPECTED_COLOR(replaceTrailingSpaces(stringify(value)));

function printWithType(name, value, print) {
  const type = getType(value);
  const hasType = type !== 'null' && type !== 'undefined' ? `${name} has type:  ${type}\n` : '';
  const hasValue = `${name} has value: ${print(value)}`;
  return hasType + hasValue;
}

const ensureNoExpected = (expected, matcherName, options) => {
  if (typeof expected !== 'undefined') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, '', options),
      'this matcher must not have an expected argument',
      printWithType('Expected', expected, printExpected)
    ));
  }
};

const ensureActualIsNumber = (actual, matcherName, options) => {
  if (typeof actual !== 'number' && typeof actual !== 'bigint') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${RECEIVED_COLOR('received')} value must be a number or bigint`,
      printWithType('Received', actual, printReceived)
    ));
  }
};

const ensureExpectedIsNumber = (expected, matcherName, options) => {
  if (typeof expected !== 'number' && typeof expected !== 'bigint') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${EXPECTED_COLOR('expected')} value must be a number or bigint`,
      printWithType('Expected', expected, printExpected)
    ));
  }
};

const ensureNumbers = (actual, expected, matcherName, options) => {
  ensureActualIsNumber(actual, matcherName, options);
  ensureExpectedIsNumber(expected, matcherName, options);
};

const ensureExpectedIsNonNegativeInteger = (expected, matcherName, options) => {
  if (typeof expected !== 'number' || !Number.isSafeInteger(expected) || expected < 0) {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${EXPECTED_COLOR('expected')} value must be a non-negative integer`,
      printWithType('Expected', expected, printExpected)
    ));
  }
};

const getCommonAndChangedSubstrings = (diffs, op, hasCommonDiff) =>
  diffs.reduce((reduced, diff) => reduced +
    (diff[0] === DIFF_EQUAL ? diff[1] : diff[0] !== op ? '' : hasCommonDiff ? INVERTED_COLOR(diff[1]) : diff[1]), '');

const isLineDiffable = (expected, received) => {
  const expectedType = getType(expected);
  const receivedType = getType(received);
  if (expectedType !== receivedType) return false;
  if (isPrimitive(expected)) {
    return typeof expected === 'string' && typeof received === 'string' &&
      expected.length !== 0 && received.length !== 0 &&
      (expected.includes('\n') || received.includes('\n'));
  }
  return !(expected instanceof Date || expected instanceof Function || expected instanceof RegExp || 
    (expected instanceof Error && received instanceof Error) || 
    (typeof received === 'object' && typeof received.asymmetricMatch === 'function'));
};

const MAX_DIFF_STRING_LENGTH = 20000;

const printDiffOrStringify = (expected, received, expectedLabel, receivedLabel, expand) => {
  if (typeof expected === 'string' && typeof received === 'string' && 
      expected.length !== 0 && received.length !== 0 &&
      expected.length <= MAX_DIFF_STRING_LENGTH && received.length <= MAX_DIFF_STRING_LENGTH &&
      expected !== received) {
    if (expected.includes('\n') || received.includes('\n')) {
      return jestDiff.diffStringsUnified(expected, received, {
        aAnnotation: expectedLabel, bAnnotation: receivedLabel, 
        changeLineTrailingSpaceColor: chalk.bgYellow,
        commonLineTrailingSpaceColor: chalk.bgYellow,
        emptyFirstOrLastLinePlaceholder: '↵',
        expand, includeChangeCounts: true
      });
    }
    const diffs = jestDiff.diffStringsRaw(expected, received, true);
    const hasCommonDiff = diffs.some(diff => diff[0] === DIFF_EQUAL);
    const printLabel = getLabelPrinter(expectedLabel, receivedLabel);
    const expectedLine = printLabel(expectedLabel) + printExpected(getCommonAndChangedSubstrings(diffs, DIFF_DELETE, hasCommonDiff));
    const receivedLine = printLabel(receivedLabel) + printReceived(getCommonAndChangedSubstrings(diffs, DIFF_INSERT, hasCommonDiff));
    return `${expectedLine}\n${receivedLine}`;
  }
  if (isLineDiffable(expected, received)) {
    const { replacedExpected, replacedReceived } = replaceMatchedToAsymmetricMatcher(expected, received, [], []);
    const difference = jestDiff(replacedExpected, replacedReceived, {
      aAnnotation: expectedLabel, bAnnotation: receivedLabel, expand, includeChangeCounts: true
    });
    if (typeof difference === 'string' && difference.includes(`- ${expectedLabel}`) && difference.includes(`+ ${receivedLabel}`)) {
      return difference;
    }
  }
  const printLabel = getLabelPrinter(expectedLabel, receivedLabel);
  const expectedLine = printLabel(expectedLabel) + printExpected(expected);
  const receivedLine = printLabel(receivedLabel) + (stringify(expected) === stringify(received) ? 'serializes to the same string' : printReceived(received));
  return `${expectedLine}\n${receivedLine}`;
};

const shouldPrintDiff = (actual, expected) => {
  if (typeof actual === 'number' && typeof expected === 'number') return false;
  if (typeof actual === 'bigint' && typeof expected === 'bigint') return false;
  if (typeof actual === 'boolean' && typeof expected === 'boolean') return false;
  return true;
};

function replaceMatchedToAsymmetricMatcher(replacedExpected, replacedReceived, expectedCycles, receivedCycles) {
  return _replaceMatchedToAsymmetricMatcher(
    deepCyclicCopyReplaceable(replacedExpected),
    deepCyclicCopyReplaceable(replacedReceived),
    expectedCycles, receivedCycles
  );
}

function _replaceMatchedToAsymmetricMatcher(replacedExpected, replacedReceived, expectedCycles, receivedCycles) {
  if (!Replaceable.isReplaceable(replacedExpected, replacedReceived)) {
    return { replacedExpected, replacedReceived };
  }
  if (expectedCycles.includes(replacedExpected) || receivedCycles.includes(replacedReceived)) {
    return { replacedExpected, replacedReceived };
  }
  expectedCycles.push(replacedExpected);
  receivedCycles.push(replacedReceived);
  const expectedReplaceable = new Replaceable(replacedExpected);
  const receivedReplaceable = new Replaceable(replacedReceived);
  expectedReplaceable.forEach((expectedValue, key) => {
    const receivedValue = receivedReplaceable.get(key);
    if (isAsymmetricMatcher(expectedValue)) {
      if (expectedValue.asymmetricMatch(receivedValue)) {
        receivedReplaceable.set(key, expectedValue);
      }
    } else if (isAsymmetricMatcher(receivedValue)) {
      if (receivedValue.asymmetricMatch(expectedValue)) {
        expectedReplaceable.set(key, receivedValue);
      }
    } else if (Replaceable.isReplaceable(expectedValue, receivedValue)) {
      const replaced = _replaceMatchedToAsymmetricMatcher(expectedValue, receivedValue, expectedCycles, receivedCycles);
      expectedReplaceable.set(key, replaced.replacedExpected);
      receivedReplaceable.set(key, replaced.replacedReceived);
    }
  });
  return { replacedExpected: expectedReplaceable.object, replacedReceived: receivedReplaceable.object };
}

function isAsymmetricMatcher(data) {
  return getType(data) === 'object' && typeof data.asymmetricMatch === 'function';
}

const diff = (a, b, options) => shouldPrintDiff(a, b) ? jestDiff(a, b, options) : null;

const pluralize = (word, count) => `${count} ${word}${count === 1 ? '' : 's'}`;

const getLabelPrinter = (...strings) => {
  const maxLength = strings.reduce((max, string) => string.length > max ? string.length : max, 0);
  return string => `${string}: ${' '.repeat(maxLength - string.length)}`;
};

const matcherErrorMessage = (hint, generic, specific) =>
  `${hint}\n\n${chalk.bold('Matcher error')}: ${generic}${typeof specific === 'string' ? `\n\n${specific}` : ''}`;

const matcherHint = (
  matcherName,
  received = 'received',
  expected = 'expected',
  options = {}
) => {
  const {
    comment = '',
    expectedColor = EXPECTED_COLOR,
    isDirectExpectCall = false,
    isNot = false,
    promise = '',
    receivedColor = RECEIVED_COLOR,
    secondArgument = '',
    secondArgumentColor = EXPECTED_COLOR,
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

export {
  printReceived,
  printExpected,
  printDiffOrStringify,
  pluralize,
  matcherHint,
  matcherErrorMessage,
  highlightTrailingWhitespace,
  getLabelPrinter,
  ensureNumbers,
  ensureNoExpected,
  ensureExpectedIsNumber,
  ensureExpectedIsNonNegativeInteger,
  ensureActualIsNumber,
  diff,
  SUGGEST_TO_CONTAIN_EQUAL,
  RECEIVED_COLOR,
  INVERTED_COLOR,
  EXPECTED_COLOR,
  DIM_COLOR,
  BOLD_WEIGHT,
  printWithType,
  replaceMatchedToAsymmetricMatcher,
  stringify,
};
