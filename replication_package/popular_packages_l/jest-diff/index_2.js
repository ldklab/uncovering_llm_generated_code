const { format } = require('pretty-format'); // Library to format/serialize values.
const diffSequences = require('diff-sequences'); // Hypothetical external library for computing diffs.
const chalk = require('chalk'); // Library for terminal string styling in different colors.

const DIFF_DELETE = -1;
const DIFF_EQUAL = 0;
const DIFF_INSERT = 1;

// Class representing a diff operation with its corresponding value.
class Diff {
  constructor(operation, value) {
    this.operation = operation;
    this.value = value;
  }
}

// Serialize a value for comparison using pretty-format.
function serialize(value) {
  return format(value);
}

// Compare two strings and return their differences.
function compareStrings(a, b, options, cleanup = true) {
  const diffs = diffSequences.diffStringsRaw(a, b, cleanup);
  if (options && options.customFormat) {
    return diffs.map(([operation, value]) => new Diff(operation, value));
  } else {
    return formatDiffs(diffs, options);
  }
}

// Compare two values and provide a visual difference or a message if they are equal.
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

// Compare two arrays of lines and format their differences.
function compareLines(aLines, bLines, options) {
  const diffs = diffSequences.diffLinesRaw(aLines, bLines);
  return formatDiffs(diffs, options);
}

// Format differences between sequences with optional styling.
function formatDiffs(diffs, options = {}) {
  const {
    aColor = chalk.green, // Default color for deletions.
    bColor = chalk.red,   // Default color for insertions.
    commonColor = chalk.dim, // Default color for unchanged values.
    aIndicator = '-',     // Indicator for deletions.
    bIndicator = '+'      // Indicator for insertions.
  } = options;

  let formatted = [];

  diffs.forEach(([operation, value]) => {
    let indicator = ' ';
    let color = commonColor;
    if (operation === DIFF_DELETE) {
      indicator = aIndicator;
      color = aColor;
    } else if (operation === DIFF_INSERT) {
      indicator = bIndicator;
      color = bColor;
    }
    formatted.push(color(`${indicator} ${value}`));
  });

  return formatted.join('\n');
}

// Public API for diffing values.
function diff(a, b, options = {}) {
  return compareValues(a, b, options);
}

// Public API for unified string diffing.
function diffStringsUnified(a, b, options) {
  return compareStrings(a, b, options);
}

// Raw string diffing without formatting options.
function diffStringsRaw(a, b, cleanup = true) {
  return compareStrings(a, b, {}, cleanup);
}

// Unified diff of lines with optional formatting.
function diffLinesUnified(aLines, bLines, options = {}) {
  return compareLines(aLines, bLines, options);
}

// More customizable unified line diff that allows for specific display changes.
function diffLinesUnified2(aLinesDisplay, bLinesDisplay, aLinesCompare, bLinesCompare, options = {}) {
  const diffResult = compareLines(aLinesCompare, bLinesCompare, options);
  return diffResult.map((line, index) => 
    line.includes(bLinesCompare[index]) ? bLinesDisplay[index] : aLinesDisplay[index]
  ).join('\n');
}

// Raw line diffing without formatting options.
function diffLinesRaw(aLines, bLines) {
  return diffSequences.diffLinesRaw(aLines, bLines);
}

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
