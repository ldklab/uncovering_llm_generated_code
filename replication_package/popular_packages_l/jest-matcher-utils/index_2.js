// jest-matcher-utils/index.js

const { diffLines } = require('diff');

// Styling Constants
const COLORS = {
  EXPECTED: '\x1b[32m',
  RECEIVED: '\x1b[31m',
  INVERTED: '\x1b[7m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m'
};

const SUGGEST_TO_CONTAIN_EQUAL = 'Did you mean to use .toContainEqual()?';

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function highlightTrailingWhitespace(text) {
  return text.replace(/[\s]+$/g, match => COLORS.INVERTED + match + COLORS.EXPECTED);
}

function printReceived(value) {
  return COLORS.RECEIVED + stringify(value) + '\x1b[0m';
}

function printExpected(value) {
  return COLORS.EXPECTED + stringify(value) + '\x1b[0m';
}

function printWithType(name, value) {
  return `${name}: ${typeof value} = ${stringify(value)}`;
}

function ensureNoExpected(expected) {
  if (typeof expected !== 'undefined') {
    throw new Error('Expected has to be undefined');
  }
}

function ensureActualIsNumber(actual) {
  if (typeof actual !== 'number') {
    throw new Error('Actual value must be a number');
  }
}

function ensureExpectedIsNumber(expected) {
  if (typeof expected !== 'number') {
    throw new Error('Expected value must be a number');
  }
}

function ensureNumbers(actual, expected) {
  ensureActualIsNumber(actual);
  ensureExpectedIsNumber(expected);
}

function ensureExpectedIsNonNegativeInteger(expected) {
  if (!Number.isInteger(expected) || expected < 0) {
    throw new Error('Expected value must be a non-negative integer');
  }
}

function printDiffOrStringify(expected, received) {
  const result = diff(stringify(expected), stringify(received));
  return result || COLORS.RECEIVED + stringify(received);
}

function diff(a, b) {
  return diffLines(a, b).map(change => {
    const color = change.added ? COLORS.EXPECTED : (change.removed ? COLORS.RECEIVED : COLORS.DIM);
    return color + change.value + '\x1b[0m';
  }).join('');
}

function pluralize(word, count) {
  return count === 1 ? word : word + 's';
}

function getLabelPrinter(...strings) {
  const maxLength = Math.max(...strings.map(s => s.length));
  return str => str + ':'.padEnd(maxLength - str.length + 2, ' ');
}

function matcherErrorMessage(hint, received, expected) {
  return `${hint}\n\nReceived:\n${printReceived(received)}\nExpected:\n${printExpected(expected)}`;
}

function matcherHint(matcherName, received = 'received', expected = 'expected', options = {}) {
  return `${COLORS.BOLD}${matcherName}${COLORS.DIM}(${received}${options.secondArgument ? `, ${expected}` : ''})\x1b[0m`;
}

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
  
  COLORS,
  SUGGEST_TO_CONTAIN_EQUAL
};
