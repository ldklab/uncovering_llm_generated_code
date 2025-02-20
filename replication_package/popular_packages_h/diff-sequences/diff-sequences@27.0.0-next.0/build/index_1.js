'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;

// Implementation of Myers' O(ND) algorithm as a linear space variation for finding longest common subsequence (LCS) and shortest edit script.
const pkg = 'diff-sequences';

const NOT_YET_SET = 0;

// Count common items in forward direction
const countCommonItemsF = (aIndex, aEnd, bIndex, bEnd, isCommon) => {
  let nCommon = 0;
  while (aIndex < aEnd && bIndex < bEnd && isCommon(aIndex, bIndex)) {
    aIndex++;
    bIndex++;
    nCommon++;
  }
  return nCommon;
};

// Count common items in reverse direction
const countCommonItemsR = (aStart, aIndex, bStart, bIndex, isCommon) => {
  let nCommon = 0;
  while (aStart <= aIndex && bStart <= bIndex && isCommon(aIndex, bIndex)) {
    aIndex--;
    bIndex--;
    nCommon++;
  }
  return nCommon;
};

// Extend forward paths
const extendPathsF = (d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF) => {
  let iF = 0, kF = -d;
  let aFirst = aIndexesF[iF];
  let aIndexPrev1 = aFirst;
  aIndexesF[iF] += countCommonItemsF(aFirst + 1, aEnd, bF + aFirst - kF + 1, bEnd, isCommon);

  const nF = Math.min(d, iMaxF);
  for (iF = 1, kF += 2; iF <= nF; iF++, kF += 2) {
    aFirst = iF !== d && aIndexPrev1 < aIndexesF[iF] ? aIndexesF[iF] : aIndexPrev1 + 1;
    if (aEnd <= aFirst) return iF - 1;
    aIndexPrev1 = aIndexesF[iF];
    aIndexesF[iF] = aFirst + countCommonItemsF(aFirst + 1, aEnd, bF + aFirst - kF + 1, bEnd, isCommon);
  }

  return iMaxF;
};

// Extend reverse paths
const extendPathsR = (d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR) => {
  let iR = 0, kR = d;
  let aFirst = aIndexesR[iR];
  let aIndexPrev1 = aFirst;
  aIndexesR[iR] -= countCommonItemsR(aStart, aFirst - 1, bStart, bR + aFirst - kR - 1, isCommon);

  const nR = Math.min(d, iMaxR);
  for (iR = 1, kR -= 2; iR <= nR; iR++, kR -= 2) {
    aFirst = iR !== d && aIndexesR[iR] < aIndexPrev1 ? aIndexesR[iR] : aIndexPrev1 - 1;
    if (aFirst < aStart) return iR - 1;
    aIndexPrev1 = aIndexesR[iR];
    aIndexesR[iR] = aFirst - countCommonItemsR(aStart, aFirst - 1, bStart, bR + aFirst - kR - 1, isCommon);
  }

  return iMaxR;
};

// Extend paths where they might overlap
const extendOverlappablePathsF = (d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division) => {
  const bF = bStart - aStart;
  const aLength = aEnd - aStart;
  const bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;

  const kMinOverlapF = -baDeltaLength - (d - 1);
  const kMaxOverlapF = -baDeltaLength + (d - 1);

  let aIndexPrev1 = NOT_YET_SET;
  const nF = Math.min(d, iMaxF);
  
  for (let iF = 0, kF = -d; iF <= nF; iF++, kF += 2) {
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
        division.nChangePreceding = d - 1;
        division.aEndPreceding = aLastPrev - nCommonR + 1;
        division.bEndPreceding = bLastPrev - nCommonR + 1;
        division.nCommonPreceding = nCommonR;
        division.aCommonPreceding = division.aEndPreceding;
        division.bCommonPreceding = division.bEndPreceding;
        division.nCommonFollowing = nCommonF;
        division.aCommonFollowing = aFirst + 1;
        division.bCommonFollowing = bFirst + 1;
        division.nChangeFollowing = d - 1;
        division.aStartFollowing = aLast + 1;
        division.bStartFollowing = bFirst + nCommonF + 1;
        return true;
      }
    }
  }
  return false;
};

// Validate input length arguments
const validateLength = (name, arg) => {
  if (typeof arg !== 'number') throw new TypeError(`${pkg}: ${name} typeof ${typeof arg} is not a number`);
  if (!Number.isSafeInteger(arg)) throw new RangeError(`${pkg}: ${name} value ${arg} is not a safe integer`);
  if (arg < 0) throw new RangeError(`${pkg}: ${name} value ${arg} is a negative integer`);
};

// Validate callback functions
const validateCallback = (name, arg) => {
  if (typeof arg !== 'function') throw new TypeError(`${pkg}: ${name} typeof ${typeof arg} is not a function`);
};

// Main exported function to find longest common subsequences
var _default = (aLength, bLength, isCommon, foundSubsequence) => {
  validateLength('aLength', aLength);
  validateLength('bLength', bLength);
  validateCallback('isCommon', isCommon);
  validateCallback('foundSubsequence', foundSubsequence);

  const nCommonF = countCommonItemsF(0, aLength, 0, bLength, isCommon);
  if (nCommonF !== 0) foundSubsequence(nCommonF, 0, 0);

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
    if (nCommonR !== 0) foundSubsequence(nCommonR, aEnd, bEnd);
  }
};

exports.default = _default;
