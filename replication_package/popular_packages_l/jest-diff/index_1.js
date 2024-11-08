const { format } = require('pretty-format');
const diffSequences = require('diff-sequences'); // Hypothetical external library
const chalk = require('chalk');

const DIFF_DELETE = -1;
const DIFF_EQUAL = 0;
const DIFF_INSERT = 1;

class Diff {
  constructor(operation, value) {
    this.operation = operation;
    this.value = value;
  }
}

function serialize(value) {
  return format(value);
}

function compareStrings(a, b, options, cleanup = true) {
  const diffs = diffSequences.diffStringsRaw(a, b, cleanup);
  return options && options.customFormat ? 
    diffs.map(([operation, value]) => new Diff(operation, value)) : 
    formatDiffs(diffs, options);
}

function compareValues(a, b, options) {
  const serializedA = serialize(a);
  const serializedB = serialize(b);
  
  if (typeof a !== typeof b) {
    return "Comparing two different types of values.";
  }
  if (Object.is(a, b) || serializedA === serializedB) {
    return "Compared values have no visual difference.";
  }

  const diffs = compareStrings(serializedA, serializedB, options);
  return diffs.length ? formatDiffs(diffs, options) : null;
}

function compareLines(aLines, bLines, options) {
  const diffs = diffSequences.diffLinesRaw(aLines, bLines);
  return formatDiffs(diffs, options);
}

function formatDiffs(diffs, options = {}) {
  const {
    aColor = chalk.green,
    bColor = chalk.red,
    commonColor = chalk.dim,
    aIndicator = '-',
    bIndicator = '+',
  } = options;

  return diffs.map(([operation, value]) => {
    let indicator = ' ';
    let color = commonColor;
    
    if (operation === DIFF_DELETE) {
      indicator = aIndicator;
      color = aColor;
    } else if (operation === DIFF_INSERT) {
      indicator = bIndicator;
      color = bColor;
    }
    
    return color(`${indicator} ${value}`);
  }).join('\n');
}

function diff(a, b, options = {}) {
  return compareValues(a, b, options);
}

function diffStringsUnified(a, b, options) {
  return compareStrings(a, b, options);
}

function diffStringsRaw(a, b, cleanup = true) {
  return compareStrings(a, b, {}, cleanup);
}

function diffLinesUnified(aLines, bLines, options = {}) {
  return compareLines(aLines, bLines, options);
}

function diffLinesUnified2(aLinesDisplay, bLinesDisplay, aLinesCompare, bLinesCompare, options = {}) {
  const diffResult = compareLines(aLinesCompare, bLinesCompare, options);
  return diffResult.map((line, index) => 
    line.includes(bLinesCompare[index]) ? bLinesDisplay[index] : aLinesDisplay[index]
  ).join('\n');
}

function diffLinesRaw(aLines, bLines) {
  return diffSequences.diffLinesRaw(aLines, bLines);
}

// Export functions and classes
module.exports = {
  DIFF_DELETE,
  DIFF_EQUAL,
  DIFF_INSERT,
  Diff,
  diff,
  diffStringsUnified,
  diffStringsRaw,
  diffLinesUnified,
  diffLinesUnified2,
  diffLinesRaw
};
