'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = diffSequence;

// Define constants for package and unset values
const pkg = 'diff-sequences';
const NOT_YET_SET = 0; 

// Counts the number of common items starting from indexes `aIndex` and `bIndex` in forward direction.
const countCommonItemsF = (aIndex, aEnd, bIndex, bEnd, isCommon) => {
  let nCommon = 0;
  while (aIndex < aEnd && bIndex < bEnd && isCommon(aIndex, bIndex)) {
    aIndex++; bIndex++; nCommon++;
  }
  return nCommon;
};

// Counts the number of common items starting from indexes `aIndex` and `bIndex` in reverse direction.
const countCommonItemsR = (aStart, aIndex, bStart, bIndex, isCommon) => {
  let nCommon = 0;
  while (aStart <= aIndex && bStart <= bIndex && isCommon(aIndex, bIndex)) {
    aIndex--; bIndex--; nCommon++;
  }
  return nCommon;
};

// Extends forward paths from (d - 1) to d changes
const extendPathsF = (d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF) => {
  let iF = 0, kF = -d;
  let aIndexPrev1 = aIndexesF[iF];
  aIndexesF[iF] += countCommonItemsF(aIndexPrev1 + 1, aEnd, bF + aIndexPrev1 - kF + 1, bEnd, isCommon);
  const nF = d < iMaxF ? d : iMaxF;

  for (iF += 1, kF += 2; iF <= nF; iF++, kF += 2) {
    const prev = aIndexPrev1 < aIndexesF[iF];
    aIndexPrev1 = prev ? aIndexesF[iF] : aIndexPrev1 + 1;
    if (aEnd <= aIndexPrev1) return iF - 1;

    aIndexPrev1 = aIndexesF[iF];
    aIndexesF[iF] = aIndexPrev1 + countCommonItemsF(aIndexPrev1 + 1, aEnd, bF + aIndexPrev1 - kF + 1, bEnd, isCommon);
  }
  return iMaxF;
};

// Extends reverse paths from (d - 1) to d changes
const extendPathsR = (d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR) => {
  let iR = 0, kR = d;
  let aIndexPrev1 = aIndexesR[iR];
  aIndexesR[iR] -= countCommonItemsR(aStart, aIndexPrev1 - 1, bStart, bR + aIndexPrev1 - kR - 1, isCommon);
  const nR = d < iMaxR ? d : iMaxR;

  for (iR += 1, kR -= 2; iR <= nR; iR++, kR -= 2) {
    const prev = aIndexesR[iR] < aIndexPrev1;
    aIndexPrev1 = prev ? aIndexesR[iR] : aIndexPrev1 - 1;
    if (aIndexPrev1 < aStart) return iR - 1;

    aIndexPrev1 = aIndexesR[iR];
    aIndexesR[iR] = aIndexPrev1 - countCommonItemsR(aStart, aIndexPrev1 - 1, bStart, bR + aIndexPrev1 - kR - 1, isCommon);
  }
  return iMaxR;
};

// Extends forward paths for overlap detection
const extendOverlappablePathsF = (d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division) => {
  const bF = bStart - aStart, aLength = aEnd - aStart, bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;
  const kMinOverlapF = -baDeltaLength - (d - 1), kMaxOverlapF = -baDeltaLength + (d - 1);
  let aIndexPrev1 = NOT_YET_SET, nF = d < iMaxF ? d : iMaxF;

  for (let iF = 0, kF = -d; iF <= nF; iF++, kF += 2) {
    const insert = iF === 0 || (iF !== d && aIndexPrev1 < aIndexesF[iF])
    const aFirst = insert ? aIndexesF[iF] : aIndexPrev1 + 1;
    const bFirst = bF + aFirst - kF;
    const nCommonF = countCommonItemsF(aFirst + 1, aEnd, bFirst + 1, bEnd, isCommon);
    const aLast = aFirst + nCommonF;

    if (kMinOverlapF <= kF && kF <= kMaxOverlapF) {
      const iR = (d - 1 - (kF + baDeltaLength)) / 2;
      if (iR <= iMaxR && aIndexesR[iR] - 1 <= aLast) {
        division.nChangePreceding = d - 1;
        return true;
      }
    }
    aIndexPrev1 = aIndexesF[iF]; aIndexesF[iF] = aLast;
  }
  return false;
};

// Extends reverse paths for overlap detection
const extendOverlappablePathsR = (d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division) => {
  const bR = bEnd - aEnd, aLength = aEnd - aStart, bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;
  const kMinOverlapR = baDeltaLength - d, kMaxOverlapR = baDeltaLength + d;
  let aIndexPrev1 = NOT_YET_SET, nR = d < iMaxR ? d : iMaxR;

  for (let iR = 0, kR = d; iR <= nR; iR++, kR -= 2) {
    const insert = iR === 0 || (iR !== d && aIndexesR[iR] < aIndexPrev1);
    const aFirst = insert ? aIndexesR[iR] : aIndexPrev1 - 1;
    const bFirst = bR + aFirst - kR;
    const nCommonR = countCommonItemsR(aStart, aFirst - 1, bStart, bFirst - 1, isCommon);
    const aLast = aFirst - nCommonR;

    if (kMinOverlapR <= kR && kR <= kMaxOverlapR) {
      const iF = (d + (kR - baDeltaLength)) / 2;
      if (iF <= iMaxF && aLast - 1 <= aIndexesF[iF]) {
        division.nChangePreceding = d;
        return true;
      }
    }
    aIndexPrev1 = aIndexesR[iR]; aIndexesR[iR] = aLast;
  }
  return false;
};

// Divides sequences at the middle change for further recursive subsequence finding
const divide = (nChange, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aIndexesR, division) => {
  const bF = bStart - aStart, aLength = aEnd - aStart, bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;

  let iMaxF = aLength, iMaxR = aLength;
  aIndexesF[0] = aStart - 1;
  aIndexesR[0] = aEnd;

  if (baDeltaLength % 2 === 0) {
    const dMin = (nChange || baDeltaLength) / 2, dMax = (aLength + bLength) / 2;

    for (let d = 1; d <= dMax; d++) {
      iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
      if (d < dMin) {
        iMaxR = extendPathsR(d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR);
      } else if (extendOverlappablePathsR(d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division)) {
        return;
      }
    }
  } else {
    const dMin = ((nChange || baDeltaLength) + 1) / 2, dMax = (aLength + bLength + 1) / 2;
    iMaxF = extendPathsF(1, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);

    for (let d = 2; d <= dMax; d++) {
      iMaxR = extendPathsR(d - 1, aStart, bStart, bR, isCommon, aIndexesR, iMaxR);
      if (d < dMin) {
        iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
      } else if (extendOverlappablePathsF(d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division)) {
        return;
      }
    }
  }

  throw new Error(`${pkg}: no overlap aStart=${aStart} aEnd=${aEnd} bStart=${bStart} bEnd=${bEnd}`);
};

// Realizes the divide-and-conquer recursion to find common subsequences with optimizations
const findSubsequences = (nChange, aStart, aEnd, bStart, bEnd, transposed, callbacks, aIndexesF, aIndexesR, division) => {
  if (bEnd - bStart < aEnd - aStart) {
    transposed = !transposed;
    if (transposed && callbacks.length === 1) {
      const {foundSubsequence, isCommon} = callbacks[0];
      callbacks[1] = {
        foundSubsequence: (nCommon, bCommon, aCommon) => {
          foundSubsequence(nCommon, aCommon, bCommon);
        },
        isCommon: (bIndex, aIndex) => isCommon(aIndex, bIndex)
      };
    }
    [aStart, aEnd, bStart, bEnd] = [bStart, bEnd, aStart, aEnd];
  }
  
  const {foundSubsequence, isCommon} = callbacks[transposed ? 1 : 0];
  divide(nChange, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aIndexesR, division);
  const {nChangePreceding, aEndPreceding, bEndPreceding, nCommonPreceding, aCommonPreceding, bCommonPreceding, nCommonFollowing, aCommonFollowing, bCommonFollowing, nChangeFollowing, aStartFollowing, bStartFollowing} = division;

  if (aStart < aEndPreceding && bStart < bEndPreceding) {
    findSubsequences(nChangePreceding, aStart, aEndPreceding, bStart, bEndPreceding, transposed, callbacks, aIndexesF, aIndexesR, division);
  }
  if (nCommonPreceding !== 0) {
    foundSubsequence(nCommonPreceding, aCommonPreceding, bCommonPreceding);
  }
  if (nCommonFollowing !== 0) {
    foundSubsequence(nCommonFollowing, aCommonFollowing, bCommonFollowing);
  }
  if (aStartFollowing < aEnd && bStartFollowing < bEnd) {
    findSubsequences(nChangeFollowing, aStartFollowing, aEnd, bStartFollowing, bEnd, transposed, callbacks, aIndexesF, aIndexesR, division);
  }
};

// Validates if the length input is a safe, non-negative integer
const validateLength = (name, arg) => {
  if (typeof arg !== 'number') {
    throw new TypeError(`${pkg}: ${name} typeof ${typeof arg} is not a number`);
  }
  if (!Number.isSafeInteger(arg)) {
    throw new RangeError(`${pkg}: ${name} value ${arg} is not a safe integer`);
  }
  if (arg < 0) {
    throw new RangeError(`${pkg}: ${name} value ${arg} is a negative integer`);
  }
};

// Validates if a callback input is a function
const validateCallback = (name, arg) => {
  if (typeof arg !== 'function') {
    throw new TypeError(`${pkg}: ${name} typeof ${typeof arg} is not a function`);
  }
};

// Main function diffSequence implementing sequence comparison
function diffSequence(aLength, bLength, isCommon, foundSubsequence) {
  validateLength('aLength', aLength);
  validateLength('bLength', bLength);
  validateCallback('isCommon', isCommon);
  validateCallback('foundSubsequence', foundSubsequence);

  const nCommonF = countCommonItemsF(0, aLength, 0, bLength, isCommon);
  if (nCommonF !== 0) {
    foundSubsequence(nCommonF, 0, 0);
  }

  if (aLength !== nCommonF || bLength !== nCommonF) {
    const aStart = nCommonF, bStart = nCommonF;
    const nCommonR = countCommonItemsR(aStart, aLength - 1, bStart, bLength - 1, isCommon);

    const aEnd = aLength - nCommonR, bEnd = bLength - nCommonR;
    const nCommonFR = nCommonF + nCommonR;

    if (aLength !== nCommonFR && bLength !== nCommonFR) {
      const nChange = 0, transposed = false;
      const callbacks = [{ foundSubsequence, isCommon }];
      const aIndexesF = [NOT_YET_SET];
      const aIndexesR = [NOT_YET_SET];
      const division = { nCommonPreceding: NOT_YET_SET, nCommonFollowing: NOT_YET_SET };

      findSubsequences(nChange, aStart, aEnd, bStart, bEnd, transposed, callbacks, aIndexesF, aIndexesR, division);
    }
    if (nCommonR !== 0) {
      foundSubsequence(nCommonR, aEnd, bEnd);
    }
  }
}
