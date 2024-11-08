// fast-diff.js
module.exports = function diff(text1, text2) {
  if (text1 === text2) {
    return text1 ? [[DIFF_EQUAL, text1]] : [];
  }

  const prefixLength = findCommonPrefix(text1, text2);
  const suffixLength = findCommonSuffix(text1.slice(prefixLength), text2.slice(prefixLength));

  const coreText1 = text1.slice(prefixLength, text1.length - suffixLength);
  const coreText2 = text2.slice(prefixLength, text2.length - suffixLength);

  const diffs = calculateDiffs(coreText1, coreText2);

  if (prefixLength > 0) {
    diffs.unshift([DIFF_EQUAL, text1.slice(0, prefixLength)]);
  }
  if (suffixLength > 0) {
    diffs.push([DIFF_EQUAL, text1.slice(text1.length - suffixLength)]);
  }

  return diffs;
};

const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

module.exports.INSERT = DIFF_INSERT;
module.exports.EQUAL = DIFF_EQUAL;
module.exports.DELETE = DIFF_DELETE;

function findCommonPrefix(text1, text2) {
  const maxLength = Math.min(text1.length, text2.length);
  for (let i = 0; i < maxLength; i++) {
    if (text1[i] !== text2[i]) return i;
  }
  return maxLength;
}

function findCommonSuffix(text1, text2) {
  const text1Length = text1.length;
  const text2Length = text2.length;
  const maxLength = Math.min(text1Length, text2Length);
  for (let i = 0; i < maxLength; i++) {
    if (text1[text1Length - i - 1] !== text2[text2Length - i - 1]) return i;
  }
  return maxLength;
}

function calculateDiffs(text1, text2) {
  if (!text1) return [[DIFF_INSERT, text2]];
  if (!text2) return [[DIFF_DELETE, text1]];

  const partitionPoint = locateMiddleSnake(text1, text2);

  if (partitionPoint === -1) {
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  } else {
    const [x, y] = partitionPoint;
    const leftDiffs = calculateDiffs(text1.slice(0, x), text2.slice(0, y));
    const rightDiffs = calculateDiffs(text1.slice(x + 1), text2.slice(y + 1));
    return [...leftDiffs, [DIFF_EQUAL, text1[x]], ...rightDiffs];
  }
}

function locateMiddleSnake(text1, text2) {
  // Implementation is skipped for brevity.
  return [Math.floor(text1.length / 2), Math.floor(text2.length / 2)];
}
