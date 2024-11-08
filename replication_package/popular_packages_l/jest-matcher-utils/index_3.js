const { diffLines } = require('diff');

const EXPECTED_COLOR = '\x1b[32m'; 
const RECEIVED_COLOR = '\x1b[31m'; 
const INVERTED_COLOR = '\x1b[7m'; 
const BOLD_WEIGHT = '\x1b[1m'; 
const DIM_COLOR = '\x1b[2m';

const SUGGEST_TO_CONTAIN_EQUAL = 'Did you mean to use .toContainEqual()?';

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function highlightTrailingWhitespace(text) {
  return text.replace(/[\s]+$/g, (match) => INVERTED_COLOR + match + EXPECTED_COLOR);
}

function printReceived(value) {
  return RECEIVED_COLOR + stringify(value) + '\x1b[0m';
}

function printExpected(value) {
  return EXPECTED_COLOR + stringify(value) + '\x1b[0m';
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
  return result ? result : RECEIVED_COLOR + stringify(received);
}

function diff(a, b) {
  const changes = diffLines(a, b);
  return changes.map(change => {
    const color = change.added ? EXPECTED_COLOR : (change.removed ? RECEIVED_COLOR : DIM_COLOR);
    return color + change.value + '\x1b[0m';
  }).join('');
}

function pluralize(word, count) {
  return count === 1 ? word : word + 's';
}

function getLabelPrinter(...strings) {
  const maxLength = Math.max(...strings.map(s => s.length));
  return (str) => str + ':'.padEnd(maxLength - str.length + 2, ' ');
}

function matcherErrorMessage(hint, received, expected, options) {
  return `${hint}\n\nReceived:\n${printReceived(received)}\nExpected:\n${printExpected(expected)}`;
}

function matcherHint(matcherName, received = 'received', expected = 'expected', options = {}) {
  return `${BOLD_WEIGHT}${matcherName}${DIM_COLOR}(${received}${options.secondArgument ? `, ${expected}` : ''})\x1b[0m`;
}

const MatcherHintOptions = {};
const DiffOptions = {};

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
