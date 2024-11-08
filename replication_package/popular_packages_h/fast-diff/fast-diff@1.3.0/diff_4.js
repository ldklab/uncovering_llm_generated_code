// Constants for diff operations
const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

/**
 * Main function to calculate differences between two text strings.
 * @param {string} text1 Original text.
 * @param {string} text2 Edited text.
 * @param {Int|Object} cursor_pos Original cursor position or an object with old and new range information.
 * @param {boolean} [cleanup] Optionally clean up semantics of the diff.
 * @return {Array} Array of diff tuples.
 */
function diff(text1, text2, cursor_pos, cleanup) {
  // Handle identical texts quickly
  if (text1 === text2) {
    return text1 ? [[DIFF_EQUAL, text1]] : [];
  }

  // Attempt to find optimal edit diff with cursor position
  if (cursor_pos != null) {
    const editdiff = findCursorEditDiff(text1, text2, cursor_pos);
    if (editdiff) return editdiff;
  }

  // Strip common prefix and suffix for efficient processing
  const commonPrefixLength = findCommonPrefix(text1, text2);
  const commonPrefix = text1.slice(0, commonPrefixLength);

  text1 = text1.slice(commonPrefixLength);
  text2 = text2.slice(commonPrefixLength);

  const commonSuffixLength = findCommonSuffix(text1, text2);
  const commonSuffix = text1.slice(-commonSuffixLength);

  text1 = text1.slice(0, -commonSuffixLength);
  text2 = text2.slice(0, -commonSuffixLength);

  // Compute diff on remaining text
  const diffs = computeDiff(text1, text2);

  // Reassemble the complete diff with restored prefix/suffix
  if (commonPrefix) diffs.unshift([DIFF_EQUAL, commonPrefix]);
  if (commonSuffix) diffs.push([DIFF_EQUAL, commonSuffix]);

  cleanupMerge(diffs, true); // Normalize and merge diffs if needed
  if (cleanup) cleanupSemantic(diffs); // Apply optional semantic cleanup
  
  return diffs;
}

// Sub-functions, constants and logic required for `diff` operation
function computeDiff(text1, text2) {
  if (!text1) return [[DIFF_INSERT, text2]];
  if (!text2) return [[DIFF_DELETE, text1]];

  const longtext = text1.length > text2.length ? text1 : text2;
  const shorttext = text1.length <= text2.length ? text1 : text2;

  const i = longtext.indexOf(shorttext);
  if (i !== -1) {
    const diffs = [
      [DIFF_INSERT, longtext.slice(0, i)],
      [DIFF_EQUAL, shorttext],
      [DIFF_INSERT, longtext.slice(i + shorttext.length)]
    ];
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shorttext.length === 1) {
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  const hm = halfMatch(text1, text2);
  if (hm) {
    const [text1a, text1b, text2a, text2b, midCommon] = hm;
    const diffsA = diff(text1a, text2a);
    const diffsB = diff(text1b, text2b);
    return diffsA.concat([[DIFF_EQUAL, midCommon]], diffsB);
  }
  
  return bisectDiff(text1, text2);
}

function bisectDiff(text1, text2) {
  const text1Length = text1.length;
  const text2Length = text2.length;
  const maxD = Math.ceil((text1Length + text2Length) / 2);
  const vOffset = maxD;
  const vLength = 2 * maxD;
  const v1 = Array(vLength).fill(-1);
  const v2 = Array(vLength).fill(-1);
  v1[vOffset + 1] = 0;
  v2[vOffset + 1] = 0;
  const delta = text1Length - text2Length;

  const front = delta % 2 !== 0;
  let k1start = 0, k1end = 0, k2start = 0, k2end = 0;

  for (let d = 0; d < maxD; d++) {
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      const k1Offset = vOffset + k1;
      let x1;
      if (k1 === -d || (k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1])) {
        x1 = v1[k1Offset + 1];
      } else {
        x1 = v1[k1Offset - 1] + 1;
      }
      let y1 = x1 - k1;
      while (x1 < text1Length && y1 < text2Length && text1[x1] === text2[y1]) {
        x1++;
        y1++;
      }
      v1[k1Offset] = x1;
        
      if (front && (x2FromMatrix = vOffset + delta - k1, v2[x2FromMatrix] !== -1 && x1 >= text1Length - v2[x2FromMatrix])) {
        return splitBisect(text1, text2, x1, y1);
      }
    }

    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const k2Offset = vOffset + k2;
      let x2;
      if (k2 === -d || (k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1])) {
        x2 = v2[k2Offset + 1];
      } else {
        x2 = v2[k2Offset - 1] + 1;
      }
      let y2 = x2 - k2;
      while (x2 < text1Length && y2 < text2Length && text1[text1Length - x2 - 1] === text2[text2Length - y2 - 1]) {
        x2++;
        y2++;
      }
      v2[k2Offset] = x2;

      if (!front && (x1FromMatrix = vOffset + delta - k2, v1[x1FromMatrix] !== -1 && v1[x1FromMatrix] >= text1Length - x2)) {
        return splitBisect(text1, text2, text1Length - x2, text2Length - y2);
      }
    }
  }
  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
}

function splitBisect(text1, text2, x, y) {
  const text1a = text1.slice(0, x);
  const text2a = text2.slice(0, y);
  const text1b = text1.slice(x);
  const text2b = text2.slice(y);

  const diffs = diff(text1a, text2a);
  const diffsb = diff(text1b, text2b);
  return diffs.concat(diffsb);
}

function findCommonPrefix(text1, text2) {
  if (!text1 || !text2 || text1[0] !== text2[0]) return 0;
  
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerstart = 0;

  while (pointermin < pointermid) {
    if (text1.slice(pointerstart, pointermid) === text2.slice(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (isSurrogateStart(text1.charCodeAt(pointermid - 1))) {
    pointermid--;
  }

  return pointermid;
}

function findCommonSuffix(text1, text2) {
  if (!text1 || !text2 || text1.slice(-1) !== text2.slice(-1)) return 0;
  
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerend = 0;

  while (pointermin < pointermid) {
    if (text1.slice(-pointermid, -pointerend) === text2.slice(-pointermid, -pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (isSurrogateEnd(text1.charCodeAt(text1.length - pointermid))) {
    pointermid--;
  }

  return pointermid;
}

function halfMatch(text1, text2) {
  const longText = text1.length > text2.length ? text1 : text2;
  const shortText = text1.length > text2.length ? text2 : text1;
  if (longText.length < 4 || shortText.length * 2 < longText.length) return null;

  function halfMatchI(longtext, shorttext, i) {
    const seed = longtext.slice(i, i + Math.floor(longtext.length / 4));
    let j = -1;
    let bestCommon = "";
    let bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB;
    
    while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
      const prefixLength = findCommonPrefix(longtext.slice(i), shorttext.slice(j));
      const suffixLength = findCommonSuffix(longtext.slice(0, i), shorttext.slice(0, j));
      
      if (bestCommon.length < suffixLength + prefixLength) {
        bestCommon = shorttext.slice(j - suffixLength, j) + shorttext.slice(j, j + prefixLength);
        bestLongtextA = longtext.slice(0, i - suffixLength);
        bestLongtextB = longtext.slice(i + prefixLength);
        bestShorttextA = shorttext.slice(0, j - suffixLength);
        bestShorttextB = shorttext.slice(j + prefixLength);
      }
    }

    return bestCommon.length * 2 >= longtext.length ? [bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB, bestCommon] : null;
  }

  const hm1 = halfMatchI(longText, shortText, Math.ceil(longText.length / 4));
  const hm2 = halfMatchI(longText, shortText, Math.ceil(longText.length / 2));

  if (!hm1 && !hm2) return null;
  if (!hm2) return hm1;
  if (!hm1) return hm2;

  return hm1[4].length > hm2[4].length ? hm1 : hm2;
}

function findCursorEditDiff(oldText, newText, cursor_pos) {
  const oldRange = typeof cursor_pos === "number" ? { index: cursor_pos, length: 0 } : cursor_pos.oldRange;
  const newRange = typeof cursor_pos === "number" ? null : cursor_pos.newRange;

  const oldLength = oldText.length;
  const newLength = newText.length;

  if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
    const oldCursor = oldRange.index;
    const oldBefore = oldText.slice(0, oldCursor);
    const oldAfter = oldText.slice(oldCursor);

    const maybeNewCursor = newRange ? newRange.index : null;
    
    // Check for insertions or deletions before or after cursor
    editBefore: {
      const newCursor = oldCursor + newLength - oldLength;
      if (maybeNewCursor !== null && maybeNewCursor !== newCursor) break editBefore;
      if (newCursor < 0 || newCursor > newLength) break editBefore;

      const newBefore = newText.slice(0, newCursor);
      const newAfter = newText.slice(newCursor);

      if (newAfter !== oldAfter) break editBefore;

      const prefixLength = Math.min(oldCursor, newCursor);
      const oldPrefix = oldBefore.slice(0, prefixLength);
      const newPrefix = newBefore.slice(0, prefixLength);

      if (oldPrefix !== newPrefix) break editBefore;

      const oldMiddle = oldBefore.slice(prefixLength);
      const newMiddle = newBefore.slice(prefixLength);

      return createEditSplice(oldPrefix, oldMiddle, newMiddle, oldAfter);
    }

    editAfter: {
      if (maybeNewCursor !== null && maybeNewCursor !== oldCursor) break editAfter;

      const newBefore = newText.slice(0, oldCursor);
      const newAfter = newText.slice(oldCursor);

      if (newBefore !== oldBefore) break editAfter;

      const suffixLength = Math.min(oldLength - oldCursor, newLength - oldCursor);
      const oldSuffix = oldAfter.slice(oldAfter.length - suffixLength);
      const newSuffix = newAfter.slice(newAfter.length - suffixLength);

      if (oldSuffix !== newSuffix) break editAfter;

      const oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength);
      const newMiddle = newAfter.slice(0, newAfter.length - suffixLength);

      return createEditSplice(oldBefore, oldMiddle, newMiddle, oldSuffix);
    }
  }
  if (oldRange.length > 0 && newRange && newRange.length === 0) {
    replaceRange: {
      const oldPrefix = oldText.slice(0, oldRange.index);
      const oldSuffix = oldText.slice(oldRange.index + oldRange.length);

      const prefixLength = oldPrefix.length;
      const suffixLength = oldSuffix.length;

      if (newLength < prefixLength + suffixLength) break replaceRange;

      const newPrefix = newText.slice(0, prefixLength);
      const newSuffix = newText.slice(newLength - suffixLength);

      if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) break replaceRange;

      const oldMiddle = oldText.slice(prefixLength, oldLength - suffixLength);
      const newMiddle = newText.slice(prefixLength, newLength - suffixLength);

      return createEditSplice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
    }
  }
  return null;
}

function createEditSplice(before, oldMiddle, newMiddle, after) {
  if (endsWithSurrogateStart(before) || startsWithSurrogateEnd(after)) {
    return null;
  }
  return removeEmptyTuples([[DIFF_EQUAL, before], [DIFF_DELETE, oldMiddle], [DIFF_INSERT, newMiddle], [DIFF_EQUAL, after]]);
}

function removeEmptyTuples(tuples) {
  return tuples.filter(tuple => tuple[1].length > 0);
}

function isSurrogateStart(charCode) {
  return charCode >= 0xD800 && charCode <= 0xDBFF;
}

function isSurrogateEnd(charCode) {
  return charCode >= 0xDC00 && charCode <= 0xDFFF;
}

function startsWithSurrogateEnd(str) {
  return isSurrogateEnd(str.charCodeAt(0));
}

function endsWithSurrogateStart(str) {
  return isSurrogateStart(str.charCodeAt(str.length - 1));
}

// Similarly define cleanupSemantic, cleanupMerge, and other utility functions
// as needed according to original logic.

diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;

module.exports = diff;
