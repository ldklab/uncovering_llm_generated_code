// jest-matcher-utils/index.js

// Import required Node.js module for creating text diff
const { diffLines } = require('diff');

// Constants for styling
const EXPECTED_COLOR = '\x1b[32m'; // Green
const RECEIVED_COLOR = '\x1b[31m'; // Red
const INVERTED_COLOR = '\x1b[7m';
const BOLD_WEIGHT = '\x1b[1m';
const DIM_COLOR = '\x1b[2m';

const SUGGEST_TO_CONTAIN_EQUAL = 'Did you mean to use .toContainEqual()?';

// Function to stringify any JavaScript value
function stringify(value) {
  return JSON.stringify(value, null, 2);
}

// Function to highlight trailing whitespace
function highlightTrailingWhitespace(text) {
  return text.replace(/[\s]+$/g, (match) => INVERTED_COLOR + match + EXPECTED_COLOR);
}

// Function to print received value
function printReceived(value) {
  return RECEIVED_COLOR + stringify(value) + '\x1b[0m';
}

// Function to print expected value
function printExpected(value) {
  return EXPECTED_COLOR + stringify(value) + '\x1b[0m';
}

// Function to print value with its type
function printWithType(name, value) {
  return `${name}: ${typeof value} = ${stringify(value)}`;
}

// Function to ensure no expected value is provided
function ensureNoExpected(expected) {
  if (typeof expected !== 'undefined') {
    throw new Error('Expected has to be undefined');
  }
}

// Function to ensure actual is a number
function ensureActualIsNumber(actual) {
  if (typeof actual !== 'number') {
    throw new Error('Actual value must be a number');
  }
}

// Function to ensure expected is a number
function ensureExpectedIsNumber(expected) {
  if (typeof expected !== 'number') {
    throw new Error('Expected value must be a number');
  }
}

// Function checks that both are numbers
function ensureNumbers(actual, expected) {
  ensureActualIsNumber(actual);
  ensureExpectedIsNumber(expected);
}

// Function to ensure expected is a non-negative integer
function ensureExpectedIsNonNegativeInteger(expected) {
  if (!Number.isInteger(expected) || expected < 0) {
    throw new Error('Expected value must be a non-negative integer');
  }
}

// Function to provide a diff or stringify
function printDiffOrStringify(expected, received) {
  const result = diff(stringify(expected), stringify(received));
  return result ? result : RECEIVED_COLOR + stringify(received);
}

// Function to calculate the difference
function diff(a, b) {
  const changes = diffLines(a, b);
  return changes.map(change => {
    const color = change.added ? EXPECTED_COLOR : (change.removed ? RECEIVED_COLOR : DIM_COLOR);
    return color + change.value + '\x1b[0m';
  }).join('');
}

// Pluralize function
function pluralize(word, count) {
  return count === 1 ? word : word + 's';
}

// Label Printer
function getLabelPrinter(...strings) {
  const maxLength = Math.max(...strings.map(s => s.length));
  return (str) => str + ':'.padEnd(maxLength - str.length + 2, ' ');
}

// Function for formatting matcher error messages
function matcherErrorMessage(hint, received, expected, options) {
  return `${hint}\n\nReceived:\n${printReceived(received)}\nExpected:\n${printExpected(expected)}`;
}

// Function to provide matcher hint
function matcherHint(matcherName, received = 'received', expected = 'expected', options = {}) {
  return `${BOLD_WEIGHT}${matcherName}${DIM_COLOR}(${received}${options.secondArgument ? `, ${expected}` : ''})\x1b[0m`;
}

// Types (not implemented in this example)
const MatcherHintOptions = {};
const DiffOptions = {};

// Exports
module.exports = {
  // Functions
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

  // Constants
  EXPECTED_COLOR,
  RECEIVED_COLOR,
  INVERTED_COLOR,
  BOLD_WEIGHT,
  DIM_COLOR,
  SUGGEST_TO_CONTAIN_EQUAL,

  // Types (if needed)
  MatcherHintOptions,
  DiffOptions
};
