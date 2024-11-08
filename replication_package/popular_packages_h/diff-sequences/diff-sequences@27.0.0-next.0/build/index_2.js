'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * This module implements a diff algorithm based on Myers' O(ND) Difference Algorithm.
 * It efficiently finds the longest common subsequence between two sequences or
 * generates the shortest edit script to transform one sequence into another.
 */

const packageName = 'diff-sequences';
const NOT_SET = 0;

// Function to count common items forward (snake length in forward path)
const countCommonForward = (aIdx, aEnd, bIdx, bEnd, isCommon) => {
  let nCommon = 0;
  while (aIdx < aEnd && bIdx < bEnd && isCommon(aIdx, bIdx)) {
    aIdx++;
    bIdx++;
    nCommon++;
  }
  return nCommon;
};

// Function to count common items in reverse (snake length in reverse path)
const countCommonReverse = (aStart, aIdx, bStart, bIdx, isCommon) => {
  let nCommon = 0;
  while (aStart <= aIdx && bStart <= bIdx && isCommon(aIdx, bIdx)) {
    aIdx--;
    bIdx--;
    nCommon++;
  }
  return nCommon;
};

// Extend forward paths functionality
const extendForwardPaths = (d, aEnd, bEnd, bOffset, isCommon, aIndexesF, maxF) => {
  let iF = 0;
  let kF = -d;
  let aFirst = aIndexesF[iF];
  let aIdxPrev1 = aFirst;

  aIndexesF[iF] += countCommonForward(
    aFirst + 1, aEnd, bOffset + aFirst - kF + 1, bEnd, isCommon
  );

  const nF = Math.min(d, maxF);
  for (iF += 1, kF += 2; iF <= nF; iF++, kF += 2) {
    aFirst = (iF !== d && aIdxPrev1 < aIndexesF[iF]) ? aIndexesF[iF] : aIdxPrev1 + 1;

    if (aEnd <= aFirst) return iF - 1;

    aIdxPrev1 = aIndexesF[iF];
    aIndexesF[iF] = aFirst + countCommonForward(
      aFirst + 1, aEnd, bOffset + aFirst - kF + 1, bEnd, isCommon
    );
  }

  return maxF;
};

// Extend reverse paths functionality
const extendReversePaths = (d, aStart, bStart, bOffset, isCommon, aIndexesR, maxR) => {
  let iR = 0;
  let kR = d;
  let aFirst = aIndexesR[iR];
  let aIdxPrev1 = aFirst;

  aIndexesR[iR] -= countCommonReverse(
    aStart, aFirst - 1, bStart, bOffset + aFirst - kR - 1, isCommon
  );

  const nR = Math.min(d, maxR);
  for (iR += 1, kR -= 2; iR <= nR; iR++, kR -= 2) {
    aFirst = (iR !== d && aIndexesR[iR] < aIdxPrev1) ? aIndexesR[iR] : aIdxPrev1 - 1;

    if (aFirst < aStart) return iR - 1;

    aIdxPrev1 = aIndexesR[iR];
    aIndexesR[iR] = aFirst - countCommonReverse(
      aStart, aFirst - 1, bStart, bOffset + aFirst - kR - 1, isCommon
    );
  }

  return maxR;
};

// Extend both forward and reverse paths, handle possible overlaps
const extendOverlappingForwardPaths = (
  d, aStart, aEnd, bStart, bEnd, isCommon,
  aIndexesF, maxF, aIndexesR, maxR, division
) => {
  const bOffsetF = bStart - aStart;
  const aLen = aEnd - aStart;
  const bLen = bEnd - bStart;
  const deltaLen = bLen - aLen;
  const kMinOverlapF = -deltaLen - (d - 1);
  const kMaxOverlapF = -deltaLen + (d - 1);

  for (let iF = 0, kF = -d, aIdxPrev = NOT_SET; iF <= maxF; iF++, kF += 2) {
    const insert = iF === 0 || (iF !== d && aIdxPrev < aIndexesF[iF]);
    const aLastPrev = insert ? aIndexesF[iF] : aIdxPrev;
    const aFirst = insert ? aLastPrev : aLastPrev + 1;
    const bFirst = bOffsetF + aFirst - kF;
    
    const nCommonF = countCommonForward(
      aFirst + 1, aEnd, bFirst + 1, bEnd, isCommon
    );

    aIdxPrev = aIndexesF[iF];
    aIndexesF[iF] = aFirst + nCommonF;

    if (kMinOverlapF <= kF && kF <= kMaxOverlapF) {
      const iR = (d - 1 - (kF + deltaLen)) / 2;
      if (iR <= maxR && aIndexesR[iR] - 1 <= aFirst + nCommonF) {
        handleDivisionFound(
          aStart, bStart, d, aFirst, bOffsetF, aLastPrev, isCommon, division
        );

        return true;
      }
    }
  }

  return false;
};

// Handle division finding during overlaps
const handleDivisionFound = (
  aStart, bStart, d, aFirst, bOffsetF, aLastPrev, isCommon, division
) => {
  const bLastPrev = bOffsetF + aLastPrev - (aLastPrev < aFirst ? d + 1 : d - 1);
  const nCommonR = countCommonReverse(
    aStart, aLastPrev, bStart, bLastPrev, isCommon
  );

  updateDivisionValues(aStart, bStart, d, aFirst, nCommonR, aLastPrev, bLastPrev, division);
};

// Update division object with calculated values
const updateDivisionValues = (
  aStart, bStart, d, aFirst, nCommonR, aLastPrev, bLastPrev, division
) => {
  const aEndPreceding = aLastPrev - nCommonR + 1;
  const bEndPreceding = bLastPrev - nCommonR + 1;
  division.nChangePreceding = d - 1;
  division.aEndPreceding = aEndPreceding;
  division.bEndPreceding = bEndPreceding;
  division.nCommonPreceding = nCommonR;

  if (nCommonR !== 0) {
    division.aCommonPreceding = aEndPreceding;
    division.bCommonPreceding = bEndPreceding;
  }

  division.nCommonFollowing = countCommonForward(aFirst + 1, aStart, bStart, aStart, () => true);
};

// Perform sequence comparison by dividing input sequences at middle change
const divide = (
  nChange, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aIndexesR, division
) => {
  const aLen = aEnd - aStart;
  const bLen = bEnd - bStart;
  const deltaLen = bLen - aLen;

  aIndexesF[0] = aStart - 1;
  aIndexesR[0] = aEnd;

  if (deltaLen % 2 === 0) {
    for (let d = 1, dMin = (nChange || deltaLen) / 2, dMax = (aLen + bLen) / 2; d <= dMax; d++) {
      let maxF = extendForwardPaths(d, aEnd, bEnd, bStart - aStart, isCommon, aIndexesF, aLen);
      if (d >= dMin && extendOverlappingForwardPaths(
        d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, maxF, aIndexesR, aLen, division)) {
        return;
      }
    }
  } else {
    for (let d = 1, dMin = ((nChange || deltaLen) + 1) / 2, dMax = (aLen + bLen + 1) / 2; d <= dMax; d++) {
      let maxR = extendReversePaths(d - 1, aStart, bStart, bEnd - aEnd, isCommon, aIndexesR, aLen);
      if (d >= dMin && extendOverlappingForwardPaths(
        d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aLen, aIndexesR, maxR, division)) {
        return;
      }
    }
  }
  
  throw new Error(`${packageName}: no overlap aStart=${aStart} aEnd=${aEnd} bStart=${bStart} bEnd=${bEnd}`);
};

// Function to validate sequence lengths
const validateLength = (name, arg) => {
  if (typeof arg !== 'number') {
    throw new TypeError(`${packageName}: ${name} is not a number`);
  }
  if (!Number.isSafeInteger(arg)) {
    throw new RangeError(`${packageName}: ${name} value is not a safe integer`);
  }
  if (arg < 0) {
    throw new RangeError(`${packageName}: ${name} value is negative`);
  }
};

// Function to validate callback functions
const validateCallback = (name, arg) => {
  if (typeof arg !== 'function') {
    throw new TypeError(`${packageName}: ${name} is not a function`);
  }
};

// Exported function to compare items in sequences, leveraging common subsequences
exports.default = (aLength, bLength, isCommon, foundSubsequence) => {
  validateLength('aLength', aLength);
  validateLength('bLength', bLength);
  validateCallback('isCommon', isCommon);
  validateCallback('foundSubsequence', foundSubsequence);

  const nCommonF = countCommonForward(0, aLength, 0, bLength, isCommon);
  if (nCommonF !== 0) {
    foundSubsequence(nCommonF, 0, 0);
  }

  if (aLength !== nCommonF || bLength !== nCommonF) {
    const aStart = nCommonF;
    const bStart = nCommonF;

    const nCommonR = countCommonReverse(aStart, aLength - 1, bStart, bLength - 1, isCommon);
    const aEnd = aLength - nCommonR;
    const bEnd = bLength - nCommonR;

    const nCommonFR = nCommonF + nCommonR;
    if (aLength !== nCommonFR && bLength !== nCommonFR) {
      const callbacks = [{ foundSubsequence, isCommon }];
      const aIndexesF = [NOT_SET];
      const aIndexesR = [NOT_SET];
      const division = {};

      findSubsequences(0, aStart, aEnd, bStart, bEnd, false, callbacks, aIndexesF, aIndexesR, division);
    }
    
    if (nCommonR !== 0) {
      foundSubsequence(nCommonR, aEnd, bEnd);
    }
  }
};
