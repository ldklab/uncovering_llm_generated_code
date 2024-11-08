'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = diffSequence;

// CONSTANTS
const pkg = 'diff-sequences'; // for error messages
const NOT_YET_SET = 0; // small int instead of undefined to avoid deopt

// Function to count common items in forward direction
const countCommonItemsF = (aIndex, aEnd, bIndex, bEnd, isCommon) => {
  let nCommon = 0;
  while (aIndex < aEnd && bIndex < bEnd && isCommon(aIndex, bIndex)) {
    aIndex += 1;
    bIndex += 1;
    nCommon += 1;
  }
  return nCommon;
};

// Function to count common items in reverse direction
const countCommonItemsR = (aStart, aIndex, bStart, bIndex, isCommon) => {
  let nCommon = 0;
  while (aStart <= aIndex && bStart <= bIndex && isCommon(aIndex, bIndex)) {
    aIndex -= 1;
    bIndex -= 1;
    nCommon += 1;
  }
  return nCommon;
};

// Extend forward paths
const extendPathsF = (d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF) => {
  let iF = 0;
  let kF = -d;
  let aFirst = aIndexesF[iF];
  let aIndexPrev1 = aFirst;
  aIndexesF[iF] += countCommonItemsF(aFirst + 1, aEnd, bF + aFirst - kF + 1, bEnd, isCommon);

  const nF = d < iMaxF ? d : iMaxF;

  for (iF += 1, kF += 2; iF <= nF; iF += 1, kF += 2) {
    if (iF !== d && aIndexPrev1 < aIndexesF[iF]) {
      aFirst = aIndexesF[iF];
    } else {
      aFirst = aIndexPrev1 + 1;
      if (aEnd <= aFirst) return iF - 1;
    }

    aIndexPrev1 = aIndexesF[iF];
    aIndexesF[iF] = aFirst + countCommonItemsF(aFirst + 1, aEnd, bF + aFirst - kF + 1, bEnd, isCommon);
  }
  return iMaxF;
};

// Extend reverse paths
const extendPathsR = (d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR) => {
  let iR = 0;
  let kR = d;
  let aFirst = aIndexesR[iR];
  let aIndexPrev1 = aFirst;
  aIndexesR[iR] -= countCommonItemsR(aStart, aFirst - 1, bStart, bR + aFirst - kR - 1, isCommon);

  const nR = d < iMaxR ? d : iMaxR;

  for (iR += 1, kR -= 2; iR <= nR; iR += 1, kR -= 2) {
    if (iR !== d && aIndexesR[iR] < aIndexPrev1) {
      aFirst = aIndexesR[iR];
    } else {
      aFirst = aIndexPrev1 - 1;
      if (aFirst < aStart) return iR - 1;
    }

    aIndexPrev1 = aIndexesR[iR];
    aIndexesR[iR] = aFirst - countCommonItemsR(aStart, aFirst - 1, bStart, bR + aFirst - kR - 1, isCommon);
  }
  return iMaxR;
};

// Extend forward paths that can overlap
const extendOverlappablePathsF = (
  d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division
) => {
  const bF = bStart - aStart;
  const aLength = aEnd - aStart;
  const bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;

  const kMinOverlapF = -baDeltaLength - (d - 1);
  const kMaxOverlapF = -baDeltaLength + (d - 1);

  let aIndexPrev1 = NOT_YET_SET;

  const nF = d < iMaxF ? d : iMaxF;

  for (let iF = 0, kF = -d; iF <= nF; iF += 1, kF += 2) {
    const insert = iF === 0 || (iF !== d && aIndexPrev1 < aIndexesF[iF]);
    const aLastPrev = insert ? aIndexesF[iF] : aIndexPrev1;

    const aFirst = insert ? aLastPrev : aLastPrev + 1;
    const bFirst = bF + aFirst - kF;
    const nCommonF = countCommonItemsF(aFirst + 1, aEnd, bFirst + 1, bEnd, isCommon);
    const aLast = aFirst + nCommonF;

    aIndexPrev1 = aIndexesF[iF];
    aIndexesF[iF] = aLast;

    if (kMinOverlapF <= kF && kF <= kMaxOverlapF) {
      const iR = (d - 1 - (kF + baDeltaLength)) / 2;

      if (iR <= iMaxR && aIndexesR[iR] - 1 <= aLast) {
        const bLastPrev = bF + aLastPrev - (insert ? kF + 1 : kF - 1);
        const nCommonR = countCommonItemsR(aStart, aLastPrev, bStart, bLastPrev, isCommon);
        const aIndexPrevFirst = aLastPrev - nCommonR;
        const bIndexPrevFirst = bLastPrev - nCommonR;

        const aEndPreceding = aIndexPrevFirst + 1;
        const bEndPreceding = bIndexPrevFirst + 1;

        division.nChangePreceding = d - 1;
        if (d - 1 === aEndPreceding + bEndPreceding - aStart - bStart) {
          division.aEndPreceding = aStart;
          division.bEndPreceding = bStart;
        } else {
          division.aEndPreceding = aEndPreceding;
          division.bEndPreceding = bEndPreceding;
        }
        division.nCommonPreceding = nCommonR;
        if (nCommonR !== 0) {
          division.aCommonPreceding = aEndPreceding;
          division.bCommonPreceding = bEndPreceding;
        }
        division.nCommonFollowing = nCommonF;
        if (nCommonF !== 0) {
          division.aCommonFollowing = aFirst + 1;
          division.bCommonFollowing = bFirst + 1;
        }
        const aStartFollowing = aLast + 1;
        const bStartFollowing = bFirst + nCommonF + 1;
        division.nChangeFollowing = d - 1;
        if (d - 1 === aEnd + bEnd - aStartFollowing - bStartFollowing) {
          division.aStartFollowing = aEnd;
          division.bStartFollowing = bEnd;
        } else {
          division.aStartFollowing = aStartFollowing;
          division.bStartFollowing = bStartFollowing;
        }
        return true;
      }
    }
  }
  return false;
};

// Extend reverse paths that can overlap
const extendOverlappablePathsR = (
  d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division
) => {
  const bR = bEnd - aEnd;
  const aLength = aEnd - aStart;
  const bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;

  const kMinOverlapR = baDeltaLength - d;
  const kMaxOverlapR = baDeltaLength + d;

  let aIndexPrev1 = NOT_YET_SET;
  const nR = d < iMaxR ? d : iMaxR;

  for (let iR = 0, kR = d; iR <= nR; iR += 1, kR -= 2) {
    const insert = iR === 0 || (iR !== d && aIndexesR[iR] < aIndexPrev1);
    const aLastPrev = insert ? aIndexesR[iR] : aIndexPrev1;
    const aFirst = insert ? aLastPrev : aLastPrev - 1;

    const bFirst = bR + aFirst - kR;
    const nCommonR = countCommonItemsR(aStart, aFirst - 1, bStart, bFirst - 1, isCommon);
    const aLast = aFirst - nCommonR;

    aIndexPrev1 = aIndexesR[iR];
    aIndexesR[iR] = aLast;

    if (kMinOverlapR <= kR && kR <= kMaxOverlapR) {
      const iF = (d + (kR - baDeltaLength)) / 2;

      if (iF <= iMaxF && aLast - 1 <= aIndexesF[iF]) {
        const bLast = bFirst - nCommonR;
        division.nChangePreceding = d;
        if (d === aLast + bLast - aStart - bStart) {
          division.aEndPreceding = aStart;
          division.bEndPreceding = bStart;
        } else {
          division.aEndPreceding = aLast;
          division.bEndPreceding = bLast;
        }
        division.nCommonPreceding = nCommonR;
        if (nCommonR !== 0) {
          division.aCommonPreceding = aLast;
          division.bCommonPreceding = bLast;
        }
        division.nChangeFollowing = d - 1;
        if (d === 1) {
          division.nCommonFollowing = 0;
          division.aStartFollowing = aEnd;
          division.bStartFollowing = bEnd;
        } else {
          const bLastPrev = bR + aLastPrev - (insert ? kR - 1 : kR + 1);
          const nCommonF = countCommonItemsF(aLastPrev, aEnd, bLastPrev, bEnd, isCommon);
          division.nCommonFollowing = nCommonF;
          if (nCommonF !== 0) {
            division.aCommonFollowing = aLastPrev;
            division.bCommonFollowing = bLastPrev;
          }
          const aStartFollowing = aLastPrev + nCommonF;
          const bStartFollowing = bLastPrev + nCommonF;

          if (d - 1 === aEnd + bEnd - aStartFollowing - bStartFollowing) {
            division.aStartFollowing = aEnd;
            division.bStartFollowing = bEnd;
          } else {
            division.aStartFollowing = aStartFollowing;
            division.bStartFollowing = bStartFollowing;
          }
        }
        return true;
      }
    }
  }
  return false;
};

// Divide the index intervals at the middle change
const divide = (nChange, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aIndexesR, division) => {
  const bF = bStart - aStart;
  const bR = bEnd - aEnd;
  const aLength = aEnd - aStart;
  const bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;

  let iMaxF = aLength;
  let iMaxR = aLength;

  aIndexesF[0] = aStart - 1;
  aIndexesR[0] = aEnd;

  if (baDeltaLength % 2 === 0) {
    const dMin = (nChange || baDeltaLength) / 2;
    const dMax = (aLength + bLength) / 2;
    for (let d = 1; d <= dMax; d += 1) {
      iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
      if (d < dMin) {
        iMaxR = extendPathsR(d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR);
      } else if (extendOverlappablePathsR(d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division)) {
        return;
      }
    }
  } else {
    const dMin = ((nChange || baDeltaLength) + 1) / 2;
    const dMax = (aLength + bLength + 1) / 2;

    let d = 1;
    iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
    for (d += 1; d <= dMax; d += 1) {
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

// Find all subsequences
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
    const tStart = aStart;
    const tEnd = aEnd;
    aStart = bStart;
    aEnd = bEnd;
    bStart = tStart;
    bEnd = tEnd;
  }
  const {foundSubsequence, isCommon} = callbacks[transposed ? 1 : 0];

  divide(nChange, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aIndexesR, division);

  const {
    nChangePreceding,
    aEndPreceding,
    bEndPreceding,
    nCommonPreceding,
    aCommonPreceding,
    bCommonPreceding,
    nCommonFollowing,
    aCommonFollowing,
    bCommonFollowing,
    nChangeFollowing,
    aStartFollowing,
    bStartFollowing
  } = division;

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

// Validate input for length
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

// Validate input for callback function
const validateCallback = (name, arg) => {
  if (typeof arg !== 'function') {
    throw new TypeError(`${pkg}: ${name} typeof ${typeof arg} is not a function`);
  }
};

// Main function to find differences
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
    const aStart = nCommonF;
    const bStart = nCommonF;

    const nCommonR = countCommonItemsR(aStart, aLength - 1, bStart, bLength - 1, isCommon);

    const aEnd = aLength - nCommonR;
    const bEnd = bLength - nCommonR;

    const nCommonFR = nCommonF + nCommonR;
    if (aLength !== nCommonFR && bLength !== nCommonFR) {
      const nChange = 0;
      const transposed = false;
      const callbacks = [{
        foundSubsequence,
        isCommon
      }];

      const aIndexesF = [NOT_YET_SET];
      const aIndexesR = [NOT_YET_SET];

      const division = {
        aCommonFollowing: NOT_YET_SET,
        aCommonPreceding: NOT_YET_SET,
        aEndPreceding: NOT_YET_SET,
        aStartFollowing: NOT_YET_SET,
        bCommonFollowing: NOT_YET_SET,
        bCommonPreceding: NOT_YET_SET,
        bEndPreceding: NOT_YET_SET,
        bStartFollowing: NOT_YET_SET,
        nChangeFollowing: NOT_YET_SET,
        nChangePreceding: NOT_YET_SET,
        nCommonFollowing: NOT_YET_SET,
        nCommonPreceding: NOT_YET_SET
      };

      findSubsequences(nChange, aStart, aEnd, bStart, bEnd, transposed, callbacks, aIndexesF, aIndexesR, division);
    }
    if (nCommonR !== 0) {
      foundSubsequence(nCommonR, aEnd, bEnd);
    }
  }
}
