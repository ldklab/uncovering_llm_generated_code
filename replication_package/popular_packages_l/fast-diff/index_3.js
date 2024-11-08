// fast-diff.js
const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

module.exports = function diff(text1, text2) {
  if (text1 === text2) {
    return text1 ? [[DIFF_EQUAL, text1]] : [];
  }

  const commonPrefixLength = commonPrefix(text1, text2);
  const commonSuffixLength = commonSuffix(text1.slice(commonPrefixLength), text2.slice(commonPrefixLength));
  
  const text1Mid = text1.slice(commonPrefixLength, text1.length - commonSuffixLength);
  const text2Mid = text2.slice(commonPrefixLength, text2.length - commonSuffixLength);

  let diffs = computeDiff(text1Mid, text2Mid);

  if (commonPrefixLength) {
    diffs.unshift([DIFF_EQUAL, text1.slice(0, commonPrefixLength)]);
  }
  if (commonSuffixLength) {
    diffs.push([DIFF_EQUAL, text1.slice(-commonSuffixLength)]);
  }

  return diffs;
};

module.exports.INSERT = DIFF_INSERT;
module.exports.EQUAL = DIFF_EQUAL;
module.exports.DELETE = DIFF_DELETE;

function commonPrefix(text1, text2) {
  const minLength = Math.min(text1.length, text2.length);
  for (let i = 0; i < minLength; i++) {
    if (text1[i] !== text2[i]) return i;
  }
  return minLength;
}

function commonSuffix(text1, text2) {
  const minLength = Math.min(text1.length, text2.length);
  for (let i = 0; i < minLength; i++) {
    if (text1[text1.length - i - 1] !== text2[text2.length - i - 1]) return i;
  }
  return minLength;
}

function computeDiff(text1, text2) {
  if (!text1) {
    return [[DIFF_INSERT, text2]];
  }

  if (!text2) {
    return [[DIFF_DELETE, text1]];
  }

  const midPoint = findMiddleSnake(text1, text2);

  if (midPoint === -1) {
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  } else {
    const [x, y] = midPoint;
    const leftDiffs = computeDiff(text1.slice(0, x), text2.slice(0, y));
    const rightDiffs = computeDiff(text1.slice(x), text2.slice(y));

    return [].concat(leftDiffs, [[DIFF_EQUAL, text1[x]]], rightDiffs);
  }
}

function findMiddleSnake(text1, text2) {
  // Implement O(ND) algorithm split point discovery (stub)
  return [Math.floor(text1.length / 2), Math.floor(text2.length / 2)];
}
