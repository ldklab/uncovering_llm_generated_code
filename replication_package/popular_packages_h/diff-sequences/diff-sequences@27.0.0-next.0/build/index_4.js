'use strict';

// Export functionality as a module
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = void 0;

// Constants to avoid deoptimization
const NOT_YET_SET = 0; 
const pkg = 'diff-sequences';

// Function to count common items in forward direction starting at indices
const countCommonItemsF = (aIndex, aEnd, bIndex, bEnd, isCommon) => {
  let nCommon = 0;
  while (aIndex < aEnd && bIndex < bEnd && isCommon(aIndex, bIndex)) {
    aIndex += 1;
    bIndex += 1;
    nCommon += 1;
  }
  return nCommon;
};

// Function to count common items in reverse direction ending at indices
const countCommonItemsR = (aStart, aIndex, bStart, bIndex, isCommon) => {
  let nCommon = 0;
  while (aStart <= aIndex && bStart <= bIndex && isCommon(aIndex, bIndex)) {
    aIndex -= 1;
    bIndex -= 1;
    nCommon += 1;
  }
  return nCommon;
};

// Extends paths in forward direction from a given number of changes
const extendPathsF = (d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF) => {
  let iF = 0;
  let aFirst = aIndexesF[iF];
  let aIndexPrev1 = aFirst;
  aIndexesF[iF] += countCommonItemsF(aFirst + 1, aEnd, bF + aFirst + 1, bEnd, isCommon); 
  const nF = d < iMaxF ? d : iMaxF;
  
  for (iF += 1; iF <= nF; iF += 1) {
    if (iF !== d && aIndexPrev1 < aIndexesF[iF]) {
      aFirst = aIndexesF[iF];
    } else {
      aFirst = aIndexPrev1 + 1;
      if (aEnd <= aFirst) return iF - 1;
    }
  
    aIndexPrev1 = aIndexesF[iF];
    aIndexesF[iF] = aFirst + countCommonItemsF(aFirst + 1, aEnd, bF + aFirst + 1, bEnd, isCommon);
  }
  return iMaxF;
};

// Extends paths in reverse direction from a given number of changes
const extendPathsR = (d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR) => {
  let iR = 0;
  let aFirst = aIndexesR[iR];
  let aIndexPrev1 = aFirst;
  aIndexesR[iR] -= countCommonItemsR(aStart, aFirst - 1, bStart, bR + aFirst - 1, isCommon);
  const nR = d < iMaxR ? d : iMaxR;

  for (iR += 1; iR <= nR; iR += 1) {
    if (iR !== d && aIndexesR[iR] < aIndexPrev1) {
      aFirst = aIndexesR[iR];
    } else {
      aFirst = aIndexPrev1 - 1;
      if (aFirst < aStart) return iR - 1;
    }

    aIndexPrev1 = aIndexesR[iR];
    aIndexesR[iR] = aFirst - countCommonItemsR(aStart, aFirst - 1, bStart, bR + aFirst - 1, isCommon);
  }
  return iMaxR;
};

// Function to extend forward paths that can potentially overlap with reverse paths
const extendOverlappablePathsF = (d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division) => {
  const bF = bStart - aStart;
  const baDeltaLength = (bEnd - bStart) - (aEnd - aStart);
  const kMinOverlapF = -baDeltaLength - (d - 1);
  const kMaxOverlapF = -baDeltaLength + (d - 1);
  let aIndexPrev1 = NOT_YET_SET;
  const nF = d < iMaxF ? d : iMaxF;

  for (let iF = 0; iF <= nF; iF += 1) {
    const insert = iF === 0 || (iF !== d && aIndexPrev1 < aIndexesF[iF]);
    const aLastPrev = insert ? aIndexesF[iF] : aIndexPrev1;
    const aFirst = insert ? aLastPrev : aLastPrev + 1;
    const bFirst = bF + aFirst - (2 * iF - d);
    const nCommonF = countCommonItemsF(aFirst + 1, aEnd, bFirst + 1, bEnd, isCommon);
    const aLast = aFirst + nCommonF;
    aIndexPrev1 = aIndexesF[iF];
    aIndexesF[iF] = aLast;

    if (kMinOverlapF <= (2 * iF - d) && (2 * iF - d) <= kMaxOverlapF) {
      const iR = (d - 1 - ((2 * iF - d) + baDeltaLength)) / 2;
      if (iR <= iMaxR && aIndexesR[iR] - 1 <= aLast) {
        const nCommonR = countCommonItemsR(aStart, aLastPrev, bStart, bF + aLastPrev - ((2 * iF - d) + 1), isCommon);
        const aIndexPrevFirst = aLastPrev - nCommonR;
        const bIndexPrevFirst = bF + aLastPrev - ((2 * iF - d) + 1) - nCommonR;
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
        division.nChangeFollowing = d - 1;
        
        const aStartFollowing = aLast + 1;
        const bStartFollowing = bFirst + nCommonF + 1;
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

// Function to extend reverse paths that can potentially overlap with forward paths
const extendOverlappablePathsR = (d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division) => {
  const bR = bEnd - aEnd;
  const baDeltaLength = (bEnd - bStart) - (aEnd - aStart);
  const kMinOverlapR = baDeltaLength - d;
  const kMaxOverlapR = baDeltaLength + d;
  let aIndexPrev1 = NOT_YET_SET;
  const nR = d < iMaxR ? d : iMaxR;

  for (let iR = 0; iR <= nR; iR += 1) {
    const insert = iR === 0 || (iR !== d && aIndexesR[iR] < aIndexPrev1);
    const aLastPrev = insert ? aIndexesR[iR] : aIndexPrev1;
    const aFirst = insert ? aLastPrev : aLastPrev - 1;
    const bFirst = bR + aFirst - (d - 2 * iR);
    const nCommonR = countCommonItemsR(aStart, aFirst - 1, bStart, bFirst - 1, isCommon);
    const aLast = aFirst - nCommonR;
    aIndexPrev1 = aIndexesR[iR];
    aIndexesR[iR] = aLast;

    if (kMinOverlapR <= (d - 2 * iR) && (d - 2 * iR) <= kMaxOverlapR) {
      const iF = (d + ((d - 2 * iR) - baDeltaLength)) / 2;
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
          const bLastPrev = bR + aLastPrev - (insert ? (d - 2 * iR) - 1 : (d - 2 * iR) + 1);
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

// Divide function to handle divide-and-conquer on sequences
const divide = (nChange, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aIndexesR, division) => {
  const bF = bStart - aStart;
  const bR = bEnd - aEnd;
  const baDeltaLength = (bEnd - bStart) - (aEnd - aStart);
  let iMaxF = aEnd - aStart;
  let iMaxR = aEnd - aStart;

  aIndexesF[0] = aStart - 1;
  aIndexesR[0] = aEnd;

  if (baDeltaLength % 2 === 0) {
    const dMin = (nChange || baDeltaLength) / 2;
    const dMax = (aEnd - aStart + bEnd - bStart) / 2;

    for (let d = 1; d <= dMax; d++) {
      iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
      if (d < dMin) {
        iMaxR = extendPathsR(d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR);
      } else if (
        extendOverlappablePathsR(
          d,
          aStart,
          aEnd,
          bStart,
          bEnd,
          isCommon,
          aIndexesF,
          iMaxF,
          aIndexesR,
          iMaxR,
          division
        )
      ) {
        return;
      }
    }
  } else {
    const dMin = ((nChange || baDeltaLength) + 1) / 2;
    const dMax = (aEnd - aStart + bEnd - bStart + 1) / 2;

    let d = 1;
    iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);

    for (d += 1; d <= dMax; d++) {
      iMaxR = extendPathsR(d - 1, aStart, bStart, bR, isCommon, aIndexesR, iMaxR);
      if (d < dMin) {
        iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
      } else if (
        extendOverlappablePathsF(
          d,
          aStart,
          aEnd,
          bStart,
          bEnd,
          isCommon,
          aIndexesF,
          iMaxF,
          aIndexesR,
          iMaxR,
          division
        )
      ) {
        return;
      }
    }
  }

  throw new Error(
    `${pkg}: no overlap aStart=${aStart} aEnd=${aEnd} bStart=${bStart} bEnd=${bEnd}`
  );
};

// Main function to calculate the longest common subsequence
var _default = (aLength, bLength, isCommon, foundSubsequence) => {
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

  const validateCallback = (name, arg) => {
    if (typeof arg !== 'function') {
      throw new TypeError(`${pkg}: ${name} typeof ${typeof arg} is not a function`);
    }
  };

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
      const callbacks = [{ foundSubsequence, isCommon }];
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
};

exports.default = _default;
