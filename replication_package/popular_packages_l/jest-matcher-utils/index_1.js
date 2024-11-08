// Required Node module for text diff
const { diffLines } = require('diff');

// Styling constants
const EXPECTED_COLOR = '\x1b[32m';
const RECEIVED_COLOR = '\x1b[31m';
const INVERTED_COLOR = '\x1b[7m';
const BOLD_WEIGHT = '\x1b[1m';
const DIM_COLOR = '\x1b[2m';

const SUGGEST_TO_CONTAIN_EQUAL = 'Did you mean to use .toContainEqual()?';

// Serialize any value to a JSON string
function stringify(value) {
  return JSON.stringify(value, null, 2);
}

// Highlight trailing spaces in text
function highlightTrailingWhitespace(text) {
  return text.replace(/[\s]+$/g, (match) => INVERTED_COLOR + match + EXPECTED_COLOR);
}

// Format received value for output
function printReceived(value) {
  return RECEIVED_COLOR + stringify(value) + '\x1b[0m';
}

// Format expected value for output
function printExpected(value) {
  return EXPECTED_COLOR + stringify(value) + '\x1b[0m';
}

// Prints the value with additional type information
function printWithType(name, value) {
  return `${name}: ${typeof value} = ${stringify(value)}`;
}

// Verify there's no expected value
function ensureNoExpected(expected) {
  if (typeof expected !== 'undefined') {
    throw new Error('Expected has to be undefined');
  }
}

// Validates actual value is a number
function ensureActualIsNumber(actual) {
  if (typeof actual !== 'number') {
    throw new Error('Actual value must be a number');
  }
}

// Validates expected value is a number
function ensureExpectedIsNumber(expected) {
  if (typeof expected !== 'number') {
    throw new Error('Expected value must be a number');
  }
}

// Check both actual and expected values are numbers
function ensureNumbers(actual, expected) {
  ensureActualIsNumber(actual);
  ensureExpectedIsNumber(expected);
}

// Ensure expected is a non-negative integer
function ensureExpectedIsNonNegativeInteger(expected) {
  if (!Number.isInteger(expected) || expected < 0) {
    throw new Error('Expected value must be a non-negative integer');
  }
}

// Provides diff or stringifies values
function printDiffOrStringify(expected, received) {
  const result = diff(stringify(expected), stringify(received));
  return result ? result : RECEIVED_COLOR + stringify(received);
}

// Computes text differences
function diff(a, b) {
  const changes = diffLines(a, b);
  return changes.map(change => {
    const color = change.added ? EXPECTED_COLOR : (change.removed ? RECEIVED_COLOR : DIM_COLOR);
    return color + change.value + '\x1b[0m';
  }).join('');
}

// Pluralizes words based on count
function pluralize(word, count) {
  return count === 1 ? word : word + 's';
}

// Print aligned labels
function getLabelPrinter(...strings) {
  const maxLength = Math.max(...strings.map(s => s.length));
  return (str) => str + ':'.padEnd(maxLength - str.length + 2, ' ');
}

// Format matcher error messages
function matcherErrorMessage(hint, received, expected, options) {
  return `${hint}\n\nReceived:\n${printReceived(received)}\nExpected:\n${printExpected(expected)}`;
}

// Prints matcher hints
function matcherHint(matcherName, received = 'received', expected = 'expected', options = {}) {
  return `${BOLD_WEIGHT}${matcherName}${DIM_COLOR}(${received}${options.secondArgument ? `, ${expected}` : ''})\x1b[0m`;
}

// Placeholder types
const MatcherHintOptions = {};
const DiffOptions = {};

// Export functions and constants
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
  EXPECTED_COLOR,
  RECEIVED_COLOR,
  INVERTED_COLOR,
  BOLD_WEIGHT,
  DIM_COLOR,
  SUGGEST_TO_CONTAIN_EQUAL,
  MatcherHintOptions,
  DiffOptions
};
