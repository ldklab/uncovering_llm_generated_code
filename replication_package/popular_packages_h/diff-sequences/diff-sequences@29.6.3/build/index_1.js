'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = diffSequence;

const pkg = 'diff-sequences';
const NOT_YET_SET = 0;

// Count the number of common items in forward direction
const countCommonItemsF = (aIndex, aEnd, bIndex, bEnd, isCommon) => {
  let count = 0;
  while (aIndex < aEnd && bIndex < bEnd && isCommon(aIndex, bIndex)) {
    aIndex++;
    bIndex++;
    count++;
  }
  return count;
};

// Count the number of common items in reverse direction
const countCommonItemsR = (aStart, aIndex, bStart, bIndex, isCommon) => {
  let count = 0;
  while (aStart <= aIndex && bStart <= bIndex && isCommon(aIndex, bIndex)) {
    aIndex--;
    bIndex--;
    count++;
  }
  return count;
};

// Extend paths forward by d changes
const extendPathsF = (d, aEnd, bEnd, bF, isCommon, aIndexesF, maxIndexF) => {
  let indexF = 0;
  let kF = -d;
  let prevIndex = aIndexesF[indexF];
  
  aIndexesF[indexF] += countCommonItemsF(prevIndex + 1, aEnd, bF + prevIndex - kF + 1, bEnd, isCommon);

  const nF = d < maxIndexF ? d : maxIndexF;

  for (indexF++, kF += 2; indexF <= nF; indexF++, kF += 2) {
    let currentFirst = (indexF !== d && prevIndex < aIndexesF[indexF]) ? aIndexesF[indexF] : prevIndex + 1;
    prevIndex = aIndexesF[indexF];
    
    aIndexesF[indexF] = currentFirst + countCommonItemsF(currentFirst + 1, aEnd, bF + currentFirst - kF + 1, bEnd, isCommon);
  }

  return maxIndexF;
};

// Extend paths reverse by d changes
const extendPathsR = (d, aStart, bStart, bR, isCommon, aIndexesR, maxIndexR) => {
  let indexR = 0;
  let kR = d;
  let prevIndex = aIndexesR[indexR];
  
  aIndexesR[indexR] -= countCommonItemsR(aStart, prevIndex - 1, bStart, bR + prevIndex - kR - 1, isCommon);

  const nR = d < maxIndexR ? d : maxIndexR;

  for (indexR++, kR -= 2; indexR <= nR; indexR++, kR -= 2) {
    let currentFirst = (indexR !== d && aIndexesR[indexR] < prevIndex) ? aIndexesR[indexR] : prevIndex - 1;
    prevIndex = aIndexesR[indexR];
    
    aIndexesR[indexR] = currentFirst - countCommonItemsR(aStart, currentFirst - 1, bStart, bR + currentFirst - kR - 1, isCommon);
  }

  return maxIndexR;
};

// Extend forward paths and check if a path overlaps with a reverse path
const extendOverlappablePathsF = (d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, maxIndexF, aIndexesR, maxIndexR, division) => {
  const bF = bStart - aStart;
  const aLength = aEnd - aStart;
  const bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;

  const kMinOverlapF = -baDeltaLength - (d - 1);
  const kMaxOverlapF = -baDeltaLength + (d - 1);
  
  let prevIndex = NOT_YET_SET;
  const nF = d < maxIndexF ? d : maxIndexF;
  
  for (let indexF = 0, kF = -d; indexF <= nF; indexF++, kF += 2) {
    const insert = indexF === 0 || (indexF !== d && prevIndex < aIndexesF[indexF]);
    const prevLast = insert ? aIndexesF[indexF] : prevIndex;
    const currentFirst = insert ? prevLast : prevLast + 1;

    const bFirst = bF + currentFirst - kF;
    const commonCount = countCommonItemsF(currentFirst + 1, aEnd, bFirst + 1, bEnd, isCommon);
    const currentLast = currentFirst + commonCount;
    prevIndex = aIndexesF[indexF];
    aIndexesF[indexF] = currentLast;

    if (kMinOverlapF <= kF && kF <= kMaxOverlapF) {
      const iR = (d - 1 - (kF + baDeltaLength)) / 2;
      if (iR <= maxIndexR && aIndexesR[iR] - 1 <= currentLast) {
        const bLastPrev = bF + prevLast - (insert ? kF + 1 : kF - 1);
        const specialCount = countCommonItemsR(aStart, prevLast, bStart, bLastPrev, isCommon);
        const indexStartPrevious = prevLast - specialCount;
        const indexEndPrevious = bLastPrev - specialCount;
        const aEndPrev = indexStartPrevious + 1;
        const bEndPrev = indexEndPrevious + 1;
        division.nChangePreceding = d - 1;
        
        if (d - 1 === aEndPrev + bEndPrev - aStart - bStart) {
          division.aEndPreceding = aStart;
          division.bEndPreceding = bStart;
        } else {
          division.aEndPreceding = aEndPrev;
          division.bEndPreceding = bEndPrev;
        }

        division.nCommonPreceding = specialCount;
        if (specialCount !== 0) {
          division.aCommonPreceding = aEndPrev;
          division.bCommonPreceding = bEndPrev;
        }

        division.nCommonFollowing = commonCount;
        if (commonCount !== 0) {
          division.aCommonFollowing = currentFirst + 1;
          division.bCommonFollowing = bFirst + 1;
        }

        const aStartFollowing = currentLast + 1;
        const bStartFollowing = bFirst + commonCount + 1;
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

// Extend reverse paths and check if a path overlaps with a forward path
const extendOverlappablePathsR = (d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, maxIndexF, aIndexesR, maxIndexR, division) => {
  const bR = bEnd - aEnd;
  const aLength = aEnd - aStart;
  const bLength = bEnd - bStart;
  const baDeltaLength = bLength - aLength;

  const kMinOverlapR = baDeltaLength - d;
  const kMaxOverlapR = baDeltaLength + d;

  let prevIndex = NOT_YET_SET;
  const nR = d < maxIndexR ? d : maxIndexR;
  
  for (let indexR = 0, kR = d; indexR <= nR; indexR++, kR -= 2) {
    const insert = indexR === 0 || (indexR !== d && aIndexesR[indexR] < prevIndex);
    const prevLast = insert ? aIndexesR[indexR] : prevIndex;
    const currentFirst = insert ? prevLast : prevLast - 1;

    const bFirst = bR + currentFirst - kR;
    const commonCount = countCommonItemsR(aStart, currentFirst - 1, bStart, bFirst - 1, isCommon);
    const currentLast = currentFirst - commonCount;
    prevIndex = aIndexesR[indexR];
    aIndexesR[indexR] = currentLast;

    if (kMinOverlapR <= kR && kR <= kMaxOverlapR) {
      const iF = (d + (kR - baDeltaLength)) / 2;
      if (iF <= maxIndexF && currentLast - 1 <= aIndexesF[iF]) {
        const bLast = bFirst - commonCount;
        division.nChangePreceding = d;
        if (d === aLast + bLast - aStart - bStart) {
          division.aEndPreceding = aStart;
          division.bEndPreceding = bStart;
        } else {
          division.aEndPreceding = currentLast;
          division.bEndPreceding = bLast;
        }

        division.nCommonPreceding = commonCount;
        if (commonCount !== 0) {
          division.aCommonPreceding = currentLast;
          division.bCommonPreceding = bLast;
        }

        division.nChangeFollowing = d - 1;
        if (d === 1) {
          division.nCommonFollowing = 0;
          division.aStartFollowing = aEnd;
          division.bStartFollowing = bEnd;
        } else {
          const bLastPrev = bR + prevLast - (insert ? kR - 1 : kR + 1);
          const specialCount = countCommonItemsF(prevLast, aEnd, bLastPrev, bEnd, isCommon);
          division.nCommonFollowing = specialCount;
          if (specialCount !== 0) {
            division.aCommonFollowing = prevLast;
            division.bCommonFollowing = bLastPrev;
          }
          
          const aStartFollowing = prevLast + specialCount;
          const bStartFollowing = bLastPrev + specialCount;

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

// Divide at the middle change
const divide = (nChange, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aIndexesR, division) => {
  const bF = bStart - aStart;
  const bR = bEnd - aEnd;
  const aLength = aEnd - aStart;
  const bLength = bEnd - bStart;

  const baDeltaLength = bLength - aLength;

  let maxIndexF = aLength;
  let maxIndexR = aLength;

  aIndexesF[0] = aStart - 1;
  aIndexesR[0] = aEnd;

  if (baDeltaLength % 2 === 0) {
    const dMin = (nChange || baDeltaLength) / 2;
    const dMax = (aLength + bLength) / 2;
    
    for (let d = 1; d <= dMax; d++) {
      maxIndexF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, maxIndexF);
      if (d < dMin) {
        maxIndexR = extendPathsR(d, aStart, bStart, bR, isCommon, aIndexesR, maxIndexR);
      } else if (extendOverlappablePathsR(d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, maxIndexF, aIndexesR, maxIndexR, division)) {
        return;
      }
    }
  } else {
    const dMin = ((nChange || baDeltaLength) + 1) / 2;
    const dMax = (aLength + bLength + 1) / 2;

    let d = 1;
    maxIndexF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, maxIndexF);
    for (d++; d <= dMax; d++) {
      maxIndexR = extendPathsR(d - 1, aStart, bStart, bR, isCommon, aIndexesR, maxIndexR);
      if (d < dMin) {
        maxIndexF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, maxIndexF);
      } else if (extendOverlappablePathsF(d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, maxIndexF, aIndexesR, maxIndexR, division)) {
        return;
      }
    }
  }
  
  throw new Error(`${pkg}: no overlap aStart=${aStart} aEnd=${aEnd} bStart=${bStart} bEnd=${bEnd}`);
};

// Find and return subsequences
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
    [aStart, bStart] = [bStart, aStart];
    [aEnd, bEnd] = [bEnd, aEnd];
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

// Validate entered length is a safe and non-negative integer
const validateLength = (name, arg) => {
  if (typeof arg !== 'number' || !Number.isSafeInteger(arg) || arg < 0) {
    throw new RangeError(`${pkg}: ${name} value ${arg} is not valid`);
  }
};

// Validate entered callback is a function
const validateCallback = (name, callback) => {
  if (typeof callback !== 'function') {
    throw new TypeError(`${pkg}: ${name} is not a function`);
  }
};

// Main function to compare sequences and find LCS
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
        nCommonPreceding: NOT_YET_SET,
      };

      findSubsequences(nChange, aStart, aEnd, bStart, bEnd, transposed, callbacks, aIndexesF, aIndexesR, division);
    }
    if (nCommonR !== 0) {
      foundSubsequence(nCommonR, aEnd, bEnd);
    }
  }
}
