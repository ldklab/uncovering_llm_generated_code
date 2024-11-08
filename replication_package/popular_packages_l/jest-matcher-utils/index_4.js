// jest-matcher-utils/index.js

const { diffLines } = require('diff');

// Styling constants
const COLORS = {
  EXPECTED: '\x1b[32m',
  RECEIVED: '\x1b[31m',
  INVERTED: '\x1b[7m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
};
const RESET = '\x1b[0m';

const SUGGESTION = 'Did you mean to use .toContainEqual()?';

// JSON stringifies a value with indentation
function stringify(value) {
  return JSON.stringify(value, null, 2);
}

// Highlight trailing spaces in a text
function highlightTrailingWhitespace(text) {
  return text.replace(/[\s]+$/g, (match) => COLORS.INVERTED + match + COLORS.EXPECTED);
}

// Style a received value for output
function printReceived(value) {
  return COLORS.RECEIVED + stringify(value) + RESET;
}

// Style an expected value for output
function printExpected(value) {
  return COLORS.EXPECTED + stringify(value) + RESET;
}

// Formats a string to show variable type
function printWithType(name, value) {
  return `${name}: ${typeof value} = ${stringify(value)}`;
}

// Throw error if expected value is not undefined
function ensureNoExpected(expected) {
  if (expected !== undefined) {
    throw new Error('Expected has to be undefined');
  }
}

// Validates that the actual value is a number
function ensureActualIsNumber(actual) {
  if (typeof actual !== 'number') throw new Error('Actual value must be a number');
}

// Validates that expected value is a number
function ensureExpectedIsNumber(expected) {
  if (typeof expected !== 'number') throw new Error('Expected value must be a number');
}

// Check both values are numbers
function ensureNumbers(actual, expected) {
  ensureActualIsNumber(actual);
  ensureExpectedIsNumber(expected);
}

// Check that expected is a non-negative integer
function ensureExpectedIsNonNegativeInteger(expected) {
  if (!Number.isInteger(expected) || expected < 0) {
    throw new Error('Expected value must be a non-negative integer');
  }
}

// Provides a diff between expected and received, or stringify received
function printDiffOrStringify(expected, received) {
  const result = diff(stringify(expected), stringify(received));
  return result ? result : COLORS.RECEIVED + stringify(received);
}

// Finds and styles differences in two strings
function diff(a, b) {
  const changes = diffLines(a, b);
  return changes.map(change => {
    const color = change.added ? COLORS.EXPECTED : (change.removed ? COLORS.RECEIVED : COLORS.DIM);
    return color + change.value + RESET;
  }).join('');
}

// Returns pluralized form of a word
function pluralize(word, count) {
  return count === 1 ? word : word + 's';
}

// Generates a label printer for aligned output
function getLabelPrinter(...strings) {
  const maxLength = Math.max(...strings.map(s => s.length));
  return (str) => str + ':'.padEnd(maxLength - str.length + 2, ' ');
}

// Formats matcher error messages
function matcherErrorMessage(hint, received, expected) {
  return `${hint}\n\nReceived:\n${printReceived(received)}\nExpected:\n${printExpected(expected)}`;
}

// Generates a matcher hint message
function matcherHint(matcherName, received = 'received', expected = 'expected', options = {}) {
  return `${COLORS.BOLD}${matcherName}${COLORS.DIM}(${received}${options.secondArgument ? `, ${expected}` : ''})${RESET}`;
}

// Mock types
const MatcherHintOptions = {};
const DiffOptions = {};

// Export all utilities and constants
module.exports = {
  stringify,
  highlightTrailingWhitespace,
  printReceived,
  printExpected,
  printWithType,
  ensureNoExpected,
  ensureActualIsNumber,
  ensureExpectedIsNumber,
  ensureNumbers,
  ensureExpectedIsNonNegativeInteger,
  printDiffOrStringify,
  diff,
  pluralize,
  getLabelPrinter,
  matcherErrorMessage,
  matcherHint,
  ...COLORS,
  SUGGESTION,
  MatcherHintOptions,
  DiffOptions
};
