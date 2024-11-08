// diffUtility.js
module.exports = function computeDiffs(primaryText, secondaryText) {
  if (primaryText === secondaryText) {
    return primaryText ? [[OP_EQUAL, primaryText]] : [];
  }

  let prefixLength = findCommonPrefix(primaryText, secondaryText);
  let suffixLength = findCommonSuffix(
    primaryText.slice(prefixLength),
    secondaryText.slice(prefixLength)
  );

  primaryText = primaryText.slice(prefixLength, primaryText.length - suffixLength);
  secondaryText = secondaryText.slice(prefixLength, secondaryText.length - suffixLength);

  let differences = calculateDiff(primaryText, secondaryText);

  if (prefixLength) {
    differences.unshift([OP_EQUAL, primaryText.slice(0, prefixLength)]);
  }
  if (suffixLength) {
    differences.push([OP_EQUAL, primaryText.slice(-suffixLength)]);
  }

  return differences;
};

const OP_DELETE = -1;
const OP_INSERT = 1;
const OP_EQUAL = 0;

module.exports.INSERT = OP_INSERT;
module.exports.EQUAL = OP_EQUAL;
module.exports.DELETE = OP_DELETE;

function findCommonPrefix(str1, str2) {
  let minLength = Math.min(str1.length, str2.length);
  for (let i = 0; i < minLength; i++) {
    if (str1[i] !== str2[i]) return i;
  }
  return minLength;
}

function findCommonSuffix(str1, str2) {
  let length1 = str1.length;
  let length2 = str2.length;
  let minLength = Math.min(length1, length2);
  for (let i = 0; i < minLength; i++) {
    if (str1[length1 - i - 1] !== str2[length2 - i - 1]) return i;
  }
  return minLength;
}

function calculateDiff(str1, str2) {
  const diffs = [];

  if (!str1) {
    return [[OP_INSERT, str2]];
  }

  if (!str2) {
    return [[OP_DELETE, str1]];
  }

  const breakpoint = middleSnake(str1, str2);

  if (breakpoint === -1) {
    diffs.push([OP_DELETE, str1]);
    diffs.push([OP_INSERT, str2]);
  } else {
    const [splitX, splitY] = breakpoint;

    const leftDiffs = calculateDiff(str1.slice(0, splitX), str2.slice(0, splitY));
    const rightDiffs = calculateDiff(str1.slice(splitX), str2.slice(splitY));

    return diffs.concat(leftDiffs, [[OP_EQUAL, str1[splitX]]], rightDiffs);
  }

  return diffs;
}

function middleSnake(str1, str2) {
  // Placeholder for detailed algorithm implementation to find the middle snake.
  return [Math.floor(str1.length / 2), Math.floor(str2.length / 2)];
}
