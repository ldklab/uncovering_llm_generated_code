'use strict';

const chalk = require('chalk');
const { diff, diffStringsUnified, diffStringsRaw, DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT } = require('jest-diff');
const { getType, isPrimitive } = require('jest-get-type');
const { format } = require('pretty-format');
const Replaceable = require('./Replaceable');
const deepCyclicCopyReplaceable = require('./deepCyclicCopyReplaceable');

const PLUGINS = [
  format.plugins.ReactTestComponent,
  format.plugins.ReactElement,
  format.plugins.DOMElement,
  format.plugins.DOMCollection,
  format.plugins.Immutable,
  format.plugins.AsymmetricMatcher
];

const COLORS = {
  EXPECTED: chalk.green,
  RECEIVED: chalk.red,
  INVERTED: chalk.inverse,
  BOLD: chalk.bold,
  DIM: chalk.dim
};

const SPACE_SYMBOL = '\u{00B7}';
const MULTILINE_REGEXP = /\n/;
const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'];

const SUGGEST_TO_CONTAIN_EQUAL = COLORS.DIM(
  'Looks like you wanted to test for object/array equality with the stricter `toContain` matcher. You probably need to use `toContainEqual` instead.'
);

const stringify = (object, maxDepth = 10, maxWidth = 10) => {
  const MAX_LENGTH = 10000;
  let result;
  try {
    result = format(object, { maxDepth, maxWidth, min: true, plugins: PLUGINS });
  } catch {
    result = format(object, { callToJSON: false, maxDepth, maxWidth, min: true, plugins: PLUGINS });
  }

  if (result.length >= MAX_LENGTH) {
    if (maxDepth > 1) return stringify(object, Math.floor(maxDepth / 2), maxWidth);
    if (maxWidth > 1) return stringify(object, maxDepth, Math.floor(maxWidth / 2));
  }
  return result;
};

const highlightTrailingWhitespace = text => text.replace(/\s+$/gm, COLORS.INVERTED('$&'));

const replaceTrailingSpaces = text => text.replace(/\s+$/gm, spaces => SPACE_SYMBOL.repeat(spaces.length));
const printReceived = object => COLORS.RECEIVED(replaceTrailingSpaces(stringify(object)));
const printExpected = value => COLORS.EXPECTED(replaceTrailingSpaces(stringify(value)));

function printWithType(name, value, print) {
  const type = getType(value);
  const hasType = type !== 'null' && type !== 'undefined' ? `${name} has type:  ${type}\n` : '';
  return hasType + `${name} has value: ${print(value)}`;
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
      `${COLORS.RECEIVED('received')} value must be a number or bigint`,
      printWithType('Received', actual, printReceived)
    ));
  }
};

const ensureExpectedIsNumber = (expected, matcherName, options) => {
  if (typeof expected !== 'number' && typeof expected !== 'bigint') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${COLORS.EXPECTED('expected')} value must be a number or bigint`,
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
      `${COLORS.EXPECTED('expected')} value must be a non-negative integer`,
      printWithType('Expected', expected, printExpected)
    ));
  }
};

const getCommonAndChangedSubstrings = (diffs, op, hasCommonDiff) =>
  diffs.reduce(
    (reduced, diff) =>
      reduced +
      (diff[0] === DIFF_EQUAL ? diff[1] : diff[0] !== op ? '' : hasCommonDiff ? COLORS.INVERTED(diff[1]) : diff[1]),
    ''
  );

const isLineDiffable = (expected, received) => {
  const expectedType = getType(expected);
  const receivedType = getType(received);
  if (expectedType !== receivedType) return false;

  if (isPrimitive(expected)) {
    return typeof expected === 'string' && typeof received === 'string' && expected.length !== 0 && received.length !== 0 &&
      (MULTILINE_REGEXP.test(expected) || MULTILINE_REGEXP.test(received));
  }

  if (expectedType === 'date' || expectedType === 'function' || expectedType === 'regexp') return false;
  if (expected instanceof Error && received instanceof Error) return false;

  return receivedType !== 'object' || typeof received.asymmetricMatch !== 'function';
};

const MAX_DIFF_STRING_LENGTH = 20000;
const printDiffOrStringify = (expected, received, expectedLabel, receivedLabel, expand) => {
  if (typeof expected === 'string' && typeof received === 'string' && expected.length !== 0 && received.length !== 0 &&
    expected.length <= MAX_DIFF_STRING_LENGTH && received.length <= MAX_DIFF_STRING_LENGTH && expected !== received) {
    if (expected.includes('\n') || received.includes('\n')) {
      return diffStringsUnified(expected, received, {
        aAnnotation: expectedLabel, bAnnotation: receivedLabel,
        changeLineTrailingSpaceColor: chalk.bgYellow,
        commonLineTrailingSpaceColor: chalk.bgYellow,
        emptyFirstOrLastLinePlaceholder: '↵', expand, includeChangeCounts: true
      });
    }
    const diffs = diffStringsRaw(expected, received, true);
    const hasCommonDiff = diffs.some(diff => diff[0] === DIFF_EQUAL);
    const printLabel = getLabelPrinter(expectedLabel, receivedLabel);
    const expectedLine = printLabel(expectedLabel) + printExpected(getCommonAndChangedSubstrings(diffs, DIFF_DELETE, hasCommonDiff));
    const receivedLine = printLabel(receivedLabel) + printReceived(getCommonAndChangedSubstrings(diffs, DIFF_INSERT, hasCommonDiff));
    return `${expectedLine}\n${receivedLine}`;
  }

  if (isLineDiffable(expected, received)) {
    const { replacedExpected, replacedReceived } = replaceMatchedToAsymmetricMatcher(expected, received, [], []);
    const difference = diff(replacedExpected, replacedReceived, { aAnnotation: expectedLabel, bAnnotation: receivedLabel, expand, includeChangeCounts: true });
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
  return _replaceMatchedToAsymmetricMatcher(deepCyclicCopyReplaceable(replacedExpected), deepCyclicCopyReplaceable(replacedReceived), expectedCycles, receivedCycles);
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

const diffFunction = (a, b, options) => shouldPrintDiff(a, b) ? diff(a, b, options) : null;

const pluralize = (word, count) => `${NUMBERS[count] || count} ${word}${count === 1 ? '' : 's'}`;

const getLabelPrinter = (...strings) => {
  const maxLength = strings.reduce((max, string) => (string.length > max ? string.length : max), 0);
  return string => `${string}: ${' '.repeat(maxLength - string.length)}`;
};

const matcherErrorMessage = (hint, generic, specific) => `${hint}\n\n${chalk.bold('Matcher error')}: ${generic}${typeof specific === 'string' ? `\n\n${specific}` : ''}`;

const matcherHint = (matcherName, received = 'received', expected = 'expected', options = {}) => {
  const {
    comment = '',
    expectedColor = COLORS.EXPECTED,
    isDirectExpectCall = false,
    isNot = false,
    promise = '',
    receivedColor = COLORS.RECEIVED,
    secondArgument = '',
    secondArgumentColor = COLORS.EXPECTED
  } = options;

  let hint = '';
  let dimString = 'expect';

  if (!isDirectExpectCall && received !== '') {
    hint += COLORS.DIM(`${dimString}(`) + receivedColor(received);
    dimString = ')';
  }
  if (promise !== '') {
    hint += COLORS.DIM(`${dimString}.`) + promise;
    dimString = '';
  }
  if (isNot) {
    hint += `${COLORS.DIM(`${dimString}.`)}not`;
    dimString = '';
  }
  if (matcherName.includes('.')) {
    dimString += matcherName;
  } else {
    hint += COLORS.DIM(`${dimString}.`) + matcherName;
    dimString = '';
  }
  if (expected === '') {
    dimString += '()';
  } else {
    hint += COLORS.DIM(`${dimString}(`) + expectedColor(expected);
    if (secondArgument) {
      hint += COLORS.DIM(', ') + secondArgumentColor(secondArgument);
    }
    dimString = ')';
  }
  if (comment !== '') {
    dimString += ` // ${comment}`;
  }
  if (dimString !== '') {
    hint += COLORS.DIM(dimString);
  }
  return hint;
};

module.exports = {
  EXPECTED_COLOR: COLORS.EXPECTED,
  RECEIVED_COLOR: COLORS.RECEIVED,
  INVERTED_COLOR: COLORS.INVERTED,
  BOLD_WEIGHT: COLORS.BOLD,
  DIM_COLOR: COLORS.DIM,
  SUGGEST_TO_CONTAIN_EQUAL,
  stringify,
  highlightTrailingWhitespace,
  printReceived,
  printExpected,
  ensureNoExpected,
  ensureActualIsNumber,
  ensureExpectedIsNumber,
  ensureNumbers,
  ensureExpectedIsNonNegativeInteger,
  printDiffOrStringify,
  diff: diffFunction,
  pluralize,
  getLabelPrinter,
  matcherErrorMessage,
  matcherHint,
  printWithType,
  replaceMatchedToAsymmetricMatcher: replaceMatchedToAsymmetricMatcher
};
