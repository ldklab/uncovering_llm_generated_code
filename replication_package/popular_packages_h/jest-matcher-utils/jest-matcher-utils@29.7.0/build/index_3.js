'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.stringify = stringify;
exports.printExpected = printExpected;
exports.printReceived = printReceived;
exports.highlightTrailingWhitespace = highlightTrailingWhitespace;
exports.diff = diff;
exports.matcherErrorMessage = matcherErrorMessage;
exports.matcherHint = matcherHint;
exports.pluralize = pluralize;
exports.getLabelPrinter = getLabelPrinter;

var _chalk = _interopRequireDefault(require('chalk'));
var _jestDiff = require('jest-diff');
var _jestGetType = require('jest-get-type');
var _prettyFormat = require('pretty-format');
var _Replaceable = _interopRequireDefault(require('./Replaceable'));
var _deepCyclicCopyReplaceable = _interopRequireDefault(require('./deepCyclicCopyReplaceable'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Type and Plugin settings for formatting
const PLUGINS = [
  _prettyFormat.plugins.ReactTestComponent,
  _prettyFormat.plugins.ReactElement,
  _prettyFormat.plugins.DOMElement,
  _prettyFormat.plugins.DOMCollection,
  _prettyFormat.plugins.Immutable,
  _prettyFormat.plugins.AsymmetricMatcher
];

// Color settings using Chalk
const EXPECTED_COLOR = _chalk.default.green;
const RECEIVED_COLOR = _chalk.default.red;
const INVERTED_COLOR = _chalk.default.inverse;
const BOLD_WEIGHT = _chalk.default.bold;
const DIM_COLOR = _chalk.default.dim;

// Regular expressions and constants
const MULTILINE_REGEXP = /\n/;
const SPACE_SYMBOL = '\u{00B7}'; // middle dot
const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'];
const SUGGEST_TO_CONTAIN_EQUAL = _chalk.default.dim('...use `toContainEqual` instead.');

// Stringify function to format objects with pretty-format
function stringify(object, maxDepth = 10, maxWidth = 10) {
  const MAX_LENGTH = 10000;
  let result;
  try {
    result = _prettyFormat.format(object, {
      maxDepth,
      maxWidth,
      min: true,
      plugins: PLUGINS
    });
  } catch {
    result = _prettyFormat.format(object, {
      callToJSON: false,
      maxDepth,
      maxWidth,
      min: true,
      plugins: PLUGINS
    });
  }

  if (result.length >= MAX_LENGTH && maxDepth > 1) {
    return stringify(object, Math.floor(maxDepth / 2), maxWidth);
  } else if (result.length >= MAX_LENGTH && maxWidth > 1) {
    return stringify(object, maxDepth, Math.floor(maxWidth / 2));
  } else {
    return result;
  }
}

// Highlight trailing whitespace
function highlightTrailingWhitespace(text) {
  return text.replace(/\s+$/gm, _chalk.default.inverse('$&'));
}

// Replace trailing spaces
function replaceTrailingSpaces(text) {
  return text.replace(/\s+$/gm, spaces => SPACE_SYMBOL.repeat(spaces.length));
}

// Print received value with color
function printReceived(object) {
  return RECEIVED_COLOR(replaceTrailingSpaces(stringify(object)));
}

// Print expected value with color
function printExpected(value) {
  return EXPECTED_COLOR(replaceTrailingSpaces(stringify(value)));
}

// Print with type information
function printWithType(name, value, print) {
  const type = _jestGetType.getType(value);
  const hasType = type !== 'null' && type !== 'undefined' ? `${name} has type:  ${type}\n` : '';
  const hasValue = `${name} has value: ${print(value)}`;
  return hasType + hasValue;
}

// Ensure that no expected argument is provided
function ensureNoExpected(expected, matcherName, options) {
  if (typeof expected !== 'undefined') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, '', options),
      'this matcher must not have an expected argument',
      printWithType('Expected', expected, printExpected)
    ));
  }
}

// Ensure received value is a number or bigint
function ensureActualIsNumber(actual, matcherName, options) {
  if (typeof actual !== 'number' && typeof actual !== 'bigint') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${RECEIVED_COLOR('received')} value must be a number or bigint`,
      printWithType('Received', actual, printReceived)
    ));
  }
}

// Ensure expected value is a number or bigint
function ensureExpectedIsNumber(expected, matcherName, options) {
  if (typeof expected !== 'number' && typeof expected !== 'bigint') {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${EXPECTED_COLOR('expected')} value must be a number or bigint`,
      printWithType('Expected', expected, printExpected)
    ));
  }
}

// Ensure both actual and expected values are numbers or bigints
function ensureNumbers(actual, expected, matcherName, options) {
  ensureActualIsNumber(actual, matcherName, options);
  ensureExpectedIsNumber(expected, matcherName, options);
}

// Ensure expected value is a non-negative integer
function ensureExpectedIsNonNegativeInteger(expected, matcherName, options) {
  if (typeof expected !== 'number' || !Number.isSafeInteger(expected) || expected < 0) {
    const matcherString = (options ? '' : '[.not]') + matcherName;
    throw new Error(matcherErrorMessage(
      matcherHint(matcherString, undefined, undefined, options),
      `${EXPECTED_COLOR('expected')} value must be a non-negative integer`,
      printWithType('Expected', expected, printExpected)
    ));
  }
}

// Check if two values should be diffed
function shouldPrintDiff(actual, expected) {
  if (typeof actual === 'number' && typeof expected === 'number') return false;
  if (typeof actual === 'bigint' && typeof expected === 'bigint') return false;
  if (typeof actual === 'boolean' && typeof expected === 'boolean') return false;
  return true;
}

// Print diff or stringify the differences
function printDiffOrStringify(expected, received, expectedLabel, receivedLabel, expand) {
  if (typeof expected === 'string' && typeof received === 'string' && 
      expected.length !== 0 && received.length !== 0 &&
      expected.length <= MAX_DIFF_STRING_LENGTH &&
      received.length <= MAX_DIFF_STRING_LENGTH &&
      expected !== received) {
    if (expected.includes('\n') || received.includes('\n')) {
      return _jestDiff.diffStringsUnified(expected, received, {
        aAnnotation: expectedLabel,
        bAnnotation: receivedLabel,
        changeLineTrailingSpaceColor: _chalk.default.bgYellow,
        commonLineTrailingSpaceColor: _chalk.default.bgYellow,
        emptyFirstOrLastLinePlaceholder: '↵',
        expand,
        includeChangeCounts: true
      });
    }
    const diffs = _jestDiff.diffStringsRaw(expected, received, true);
    const hasCommonDiff = diffs.some(diff => diff[0] === _jestDiff.DIFF_EQUAL);
    const printLabel = getLabelPrinter(expectedLabel, receivedLabel);
    const expectedLine = printLabel(expectedLabel) + printExpected(getCommonAndChangedSubstrings(diffs, _jestDiff.DIFF_DELETE, hasCommonDiff));
    const receivedLine = printLabel(receivedLabel) + printReceived(getCommonAndChangedSubstrings(diffs, _jestDiff.DIFF_INSERT, hasCommonDiff));
    return `${expectedLine}\n${receivedLine}`;
  }
  if (isLineDiffable(expected, received)) {
    const { replacedExpected, replacedReceived } = replaceMatchedToAsymmetricMatcher(expected, received, [], []);
    const difference = _jestDiff.diff(replacedExpected, replacedReceived, {
      aAnnotation: expectedLabel,
      bAnnotation: receivedLabel,
      expand,
      includeChangeCounts: true
    });
    if (difference.includes(`- ${expectedLabel}`) && difference.includes(`+ ${receivedLabel}`)) {
      return difference;
    }
  }
  const printLabel = getLabelPrinter(expectedLabel, receivedLabel);
  const expectedLine = printLabel(expectedLabel) + printExpected(expected);
  const receivedLine = printLabel(receivedLabel) + (stringify(expected) === stringify(received) ? 'serializes to the same string' : printReceived(received));
  return `${expectedLine}\n${receivedLine}`;
}

// Return label printing function
function getLabelPrinter(...strings) {
  const maxLength = strings.reduce((max, string) => string.length > max ? string.length : max, 0);
  return string => `${string}: ${' '.repeat(maxLength - string.length)}`;
}

// Error message formatting
function matcherErrorMessage(hint, generic, specific) {
  return `${hint}\n\n${BOLD_WEIGHT('Matcher error')}: ${generic}${specific ? `\n\n${specific}` : ''}`;
}

// Matcher hint for displaying hints
function matcherHint(matcherName, received = 'received', expected = 'expected', options = {}) {
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
  hint += DIM_COLOR(dimString);
  return hint;
}

// Diff function to compare values
function diff(a, b, options) {
  return shouldPrintDiff(a, b) ? _jestDiff.diff(a, b, options) : null;
}

// Function to return pluralized form of a word
function pluralize(word, count) {
  return `${NUMBERS[count] || count} ${word}${count === 1 ? '' : 's'}`;
}

function replaceMatchedToAsymmetricMatcher(replacedExpected, replacedReceived, expectedCycles, receivedCycles) {
  return _replaceMatchedToAsymmetricMatcher(
    _deepCyclicCopyReplaceable.default(replacedExpected),
    _deepCyclicCopyReplaceable.default(replacedReceived),
    expectedCycles,
    receivedCycles
  );
}

function _replaceMatchedToAsymmetricMatcher(replacedExpected, replacedReceived, expectedCycles, receivedCycles) {
  if (!_Replaceable.default.isReplaceable(replacedExpected, replacedReceived)) {
    return { replacedExpected, replacedReceived };
  }

  if (expectedCycles.includes(replacedExpected) || receivedCycles.includes(replacedReceived)) {
    return { replacedExpected, replacedReceived };
  }

  expectedCycles.push(replacedExpected);
  receivedCycles.push(replacedReceived);

  const expectedReplaceable = new _Replaceable.default(replacedExpected);
  const receivedReplaceable = new _Replaceable.default(replacedReceived);

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
    } else if (_Replaceable.default.isReplaceable(expectedValue, receivedValue)) {
      const replaced = _replaceMatchedToAsymmetricMatcher(
        expectedValue,
        receivedValue,
        expectedCycles,
        receivedCycles
      );
      expectedReplaceable.set(key, replaced.replacedExpected);
      receivedReplaceable.set(key, replaced.replacedReceived);
    }
  });

  return {
    replacedExpected: expectedReplaceable.object,
    replacedReceived: receivedReplaceable.object
  };
}

function isAsymmetricMatcher(data) {
  const type = _jestGetType.getType(data);
  return type === 'object' && typeof data.asymmetricMatch === 'function';
}
