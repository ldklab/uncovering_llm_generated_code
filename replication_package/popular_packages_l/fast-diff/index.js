// fast-diff.js
module.exports = function diff(text1, text2, cursorPos) {
  if (text1 === text2) {
    return text1 ? [[DIFF_EQUAL, text1]] : [];
  }

  let commonPrefixLength = commonPrefix(text1, text2);
  let commonSuffixLength = commonSuffix(text1.slice(commonPrefixLength), text2.slice(commonPrefixLength));

  text1 = text1.slice(commonPrefixLength, text1.length - commonSuffixLength);
  text2 = text2.slice(commonPrefixLength, text2.length - commonSuffixLength);

  let diffs = computeDiff(text1, text2);

  if (commonPrefixLength) {
    diffs.unshift([DIFF_EQUAL, text1.slice(0, commonPrefixLength)]);
  }
  if (commonSuffixLength) {
    diffs.push([DIFF_EQUAL, text1.slice(-commonSuffixLength)]);
  }

  return diffs;
};

const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

module.exports.INSERT = DIFF_INSERT;
module.exports.EQUAL = DIFF_EQUAL;
module.exports.DELETE = DIFF_DELETE;

function commonPrefix(text1, text2) {
  let n = Math.min(text1.length, text2.length);
  for (let i = 0; i < n; i++) {
    if (text1[i] !== text2[i]) return i;
  }
  return n;
}

function commonSuffix(text1, text2) {
  let text1Length = text1.length;
  let text2Length = text2.length;
  let n = Math.min(text1Length, text2Length);
  for (let i = 0; i < n; i++) {
    if (text1[text1Length - i - 1] !== text2[text2Length - i - 1]) return i;
  }
  return n;
}

function computeDiff(text1, text2) {
  const diffs = [];

  if (!text1) {
    return [[DIFF_INSERT, text2]];
  }

  if (!text2) {
    return [[DIFF_DELETE, text1]];
  }

  const pointer = findMiddleSnake(text1, text2);

  if (pointer === -1) {
    diffs.push([DIFF_DELETE, text1]);
    diffs.push([DIFF_INSERT, text2]);
  } else {
    const [x, y] = pointer;

    const leftPartDiffs = computeDiff(text1.slice(0, x), text2.slice(0, y));
    const rightPartDiffs = computeDiff(text1.slice(x), text2.slice(y));

    return diffs.concat(leftPartDiffs, [[DIFF_EQUAL, text1[x]]], rightPartDiffs);
  }

  return diffs;
}

function findMiddleSnake(text1, text2) {
  // Omitted detailed implementation for brevity
  // Implements O(ND) algorithm and divide and conquer strategy.
  // Returns the position in the text where partition happens.
  return [Math.floor(text1.length / 2), Math.floor(text2.length / 2)];
}
