const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

function diff(text1, text2, cursor_pos, cleanup) {
  return diff_main(text1, text2, cursor_pos, cleanup, true);
}

function diff_main(text1, text2, cursor_pos, cleanup, _fix_unicode) {
  if (text1 === text2) {
    return text1 ? [[DIFF_EQUAL, text1]] : [];
  }

  if (cursor_pos != null) {
    const editdiff = find_cursor_edit_diff(text1, text2, cursor_pos);
    if (editdiff) return editdiff;
  }

  let commonprefix = diff_commonPrefix(text1, text2);
  let commonsuffix = diff_commonSuffix(text1, text2);
  text1 = text1.substring(commonprefix, text1.length - commonsuffix);
  text2 = text2.substring(commonprefix, text2.length - commonsuffix);

  let diffs = diff_compute_(text1, text2);

  if (commonprefix) diffs.unshift([DIFF_EQUAL, text1.substring(0, commonprefix)]);
  if (commonsuffix) diffs.push([DIFF_EQUAL, text1.slice(-commonsuffix)]);

  diff_cleanupMerge(diffs, _fix_unicode);
  if (cleanup) diff_cleanupSemantic(diffs);
  
  return diffs;
}

function diff_compute_(text1, text2) {
  if (!text1) return [[DIFF_INSERT, text2]];
  if (!text2) return [[DIFF_DELETE, text1]];

  let longtext = text1.length > text2.length ? text1 : text2;
  let shorttext = text1.length > text2.length ? text2 : text1;
  let i = longtext.indexOf(shorttext);
  if (i !== -1) {
    let diffs = [
      [DIFF_INSERT, longtext.substring(0, i)],
      [DIFF_EQUAL, shorttext],
      [DIFF_INSERT, longtext.substring(i + shorttext.length)],
    ];
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shorttext.length === 1) {
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  let hm = diff_halfMatch_(text1, text2);
  if (hm) {
    let diffs_a = diff_main(hm[0], hm[2]);
    let diffs_b = diff_main(hm[1], hm[3]);
    return [...diffs_a, [DIFF_EQUAL, hm[4]], ...diffs_b];
  }

  return diff_bisect_(text1, text2);
}

function diff_commonPrefix(text1, text2) {
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) return 0;
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  while (pointermin < pointermid) {
    if (text1.substring(0, pointermid) === text2.substring(0, pointermid)) {
      pointermin = pointermid;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  return is_surrogate_pair_start(text1.charCodeAt(pointermid - 1)) ? pointermid - 1 : pointermid;
}

function diff_commonSuffix(text1, text2) {
  if (!text1 || !text2 || text1.slice(-1) !== text2.slice(-1)) return 0;
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  while (pointermin < pointermid) {
    if (text1.slice(-pointermid) === text2.slice(-pointermid)) {
      pointermin = pointermid;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  return is_surrogate_pair_end(text1.charCodeAt(text1.length - pointermid)) ? pointermid - 1 : pointermid;
}

function diff_halfMatch_(text1, text2) {
  const longtext = text1.length > text2.length ? text1 : text2;
  const shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) return null;

  function diff_halfMatchI_(longtext, shorttext, i) {
    const seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    let j = -1;
    let best_common = "";
    let best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
      const prefixLength = diff_commonPrefix(longtext.substring(i), shorttext.substring(j));
      const suffixLength = diff_commonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
      if (best_common.length < suffixLength + prefixLength) {
        best_common = shorttext.substring(j - suffixLength, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }

    if (best_common.length * 2 >= longtext.length) {
      return [best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b, best_common];
    }

    return null;
  }

  const hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
  const hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
  if (!hm1 && !hm2) {
    return null;
  }
  return !hm2 || (hm1 && hm1[4].length > hm2[4].length) ? hm1 : hm2;
}

function diff_bisect_(text1, text2) {
  const text1_length = text1.length;
  const text2_length = text2.length;
  const max_d = Math.ceil((text1_length + text2_length) / 2);
  const v_offset = max_d;
  const v_length = 2 * max_d;
  const v1 = new Array(v_length);
  const v2 = new Array(v_length);
  v1.fill(-1);
  v2.fill(-1);
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  const delta = text1_length - text2_length;
  const front = delta % 2 !== 0;
  let k1start = 0;
  let k1end = 0;
  let k2start = 0;
  let k2end = 0;

  for (let d = 0; d < max_d; d++) {
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      const k1_offset = v_offset + k1;
      const x1 = (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) ? v1[k1_offset + 1] : v1[k1_offset - 1] + 1;
      const y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) === text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        k1end += 2;
      } else if (y1 > text2_length) {
        k1start += 2;
      } else if (front) {
        const k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
          const x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) return diff_bisectSplit_(text1, text2, x1, y1);
        }
      }
    }

    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const k2_offset = v_offset + k2;
      const x2 = (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) ? v2[k2_offset + 1] : v2[k2_offset - 1] + 1;
      const y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length && text1.charAt(text1.length - x2 - 1) === text2.charAt(text2.length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        k2end += 2;
      } else if (y2 > text2_length) {
        k2start += 2;
      } else if (!front) {
        const k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
          const x1 = v1[k1_offset];
          x2 = text1_length - x2;
          if (x1 >= x2) return diff_bisectSplit_(text1, text2, x1, y1);
        }
      }
    }
  }

  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
}

function diff_bisectSplit_(text1, text2, x, y) {
  const text1a = text1.substring(0, x);
  const text2a = text2.substring(0, y);
  const text1b = text1.substring(x);
  const text2b = text2.substring(y);

  const diffs = diff_main(text1a, text2a);
  const diffsb = diff_main(text1b, text2b);

  return diffs.concat(diffsb);
}

function diff_cleanupSemantic(diffs) {
  let changes = false;
  let equalities = [];
  let equalitiesLength = 0;
  let lastequality = null;
  let pointer = 0;
  let length_insertions1 = 0;
  let length_deletions1 = 0;
  let length_insertions2 = 0;
  let length_deletions2 = 0;

  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastequality = diffs[pointer][1];
    } else {
      if (diffs[pointer][0] == DIFF_INSERT) {
        length_insertions2 += diffs[pointer][1].length;
      } else {
        length_deletions2 += diffs[pointer][1].length;
      }

      if (
        lastequality &&
        lastequality.length <= Math.max(length_insertions1, length_deletions1) &&
        lastequality.length <= Math.max(length_insertions2, length_deletions2)
      ) {
        diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        equalitiesLength--;
        equalitiesLength--;
        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
        length_insertions1 = 0;
        length_deletions1 = 0;
        length_insertions2 = 0;
        length_deletions2 = 0;
        lastequality = null;
        changes = true;
      }
    }
    pointer++;
  }

  if (changes) diff_cleanupMerge(diffs);
  diff_cleanupSemanticLossless(diffs);

  pointer = 1;
  while (pointer < diffs.length) {
    if (diffs[pointer - 1][0] == DIFF_DELETE && diffs[pointer][0] == DIFF_INSERT) {
      const deletion = diffs[pointer - 1][1];
      const insertion = diffs[pointer][1];
      const overlap_length1 = diff_commonOverlap_(deletion, insertion);
      const overlap_length2 = diff_commonOverlap_(insertion, deletion);
      if (overlap_length1 >= overlap_length2) {
        if (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) {
          diffs.splice(pointer, 0, [DIFF_EQUAL, insertion.substring(0, overlap_length1)]);
          diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlap_length1);
          diffs[pointer + 1][1] = insertion.substring(overlap_length1);
          pointer++;
        }
      } else {
        if (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) {
          diffs.splice(pointer, 0, [DIFF_EQUAL, deletion.substring(0, overlap_length2)]);
          diffs[pointer - 1][0] = DIFF_INSERT;
          diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlap_length2);
          diffs[pointer + 1][0] = DIFF_DELETE;
          diffs[pointer + 1][1] = deletion.substring(overlap_length2);
          pointer++;
        }
      }
      pointer++;
    }
    pointer++;
  }
}

function diff_cleanupSemanticLossless(diffs) {
  const nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
  const whitespaceRegex_ = /\s/;
  const linebreakRegex_ = /[\r\n]/;
  const blanklineEndRegex_ = /\n\r?\n$/;
  const blanklineStartRegex_ = /^\r?\n\r?\n/;

  function diff_cleanupSemanticScore_(one, two) {
    if (!one || !two) return 6;

    let char1 = one.charAt(one.length - 1);
    let char2 = two.charAt(0);
    let nonAlphaNumeric1 = char1.match(nonAlphaNumericRegex_);
    let nonAlphaNumeric2 = char2.match(nonAlphaNumeric1);
    let whitespace1 = nonAlphaNumeric1 && char1.match(whitespaceRegex_);
    let whitespace2 = nonAlphaNumeric2 && char2.match(whitespaceRegex_);
    let lineBreak1 = whitespace1 && char1.match(linebreakRegex_);
    let lineBreak2 = whitespace2 && char2.match(linebreakRegex_);
    let blankLine1 = lineBreak1 && one.match(blanklineEndRegex_);
    let blankLine2 = lineBreak2 && two.match(blanklineStartRegex_);
    
    if (blankLine1 || blankLine2) return 5;
    if (lineBreak1 || lineBreak2) return 4;
    if (nonAlphaNumeric1 && !whitespace1 && whitespace2) return 3;
    if (whitespace1 || whitespace2) return 2;
    if (nonAlphaNumeric1 || nonAlphaNumeric2) return 1;

    return 0;
  }

  let pointer = 1;
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
      let equality1 = diffs[pointer - 1][1];
      let edit = diffs[pointer][1];
      let equality2 = diffs[pointer + 1][1];

      let commonOffset = diff_commonSuffix(equality1, edit);
      if (commonOffset) {
        let commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }
      
      let bestEquality1 = equality1;
      let bestEdit = edit;
      let bestEquality2 = equality2;
      let bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        const score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }

      if (diffs[pointer - 1][1] != bestEquality1) {
        if (bestEquality1) {
          diffs[pointer - 1][1] = bestEquality1;
        } else {
          diffs.splice(pointer - 1, 1);
          pointer--;
        }
        diffs[pointer][1] = bestEdit;
        if (bestEquality2) {
          diffs[pointer + 1][1] = bestEquality2;
        } else {
          diffs.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
}

function diff_cleanupMerge(diffs, fix_unicode) {
  diffs.push([DIFF_EQUAL, ""]);
  let pointer = 0;
  let count_delete = 0;
  let count_insert = 0;
  let text_delete = "";
  let text_insert = "";
  let commonlength;
  
  while (pointer < diffs.length) {
    if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
      diffs.splice(pointer, 1);
      continue;
    }

    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        let previous_equality = pointer - count_insert - count_delete - 1;
        if (fix_unicode) {
          if (previous_equality >= 0 && ends_with_pair_start(diffs[previous_equality][1])) {
            let stray = diffs[previous_equality][1].slice(-1);
            diffs[previous_equality][1] = diffs[previous_equality][1].slice(0, -1);
            text_delete = stray + text_delete;
            text_insert = stray + text_insert;
            if (!diffs[previous_equality][1]) {
              diffs.splice(previous_equality, 1);
              pointer--;
              let k = previous_equality - 1;
              if (diffs[k] && diffs[k][0] === DIFF_INSERT) {
                count_insert++;
                text_insert = diffs[k][1] + text_insert;
                k--;
              }
              if (diffs[k] && diffs[k][0] === DIFF_DELETE) {
                count_delete++;
                text_delete = diffs[k][1] + text_delete;
                k--;
              }
              previous_equality = k;
            }
          }
          if (starts_with_pair_end(diffs[pointer][1])) {
            let stray = diffs[pointer][1].charAt(0);
            diffs[pointer][1] = diffs[pointer][1].slice(1);
            text_delete += stray;
            text_insert += stray;
          }
        }

        if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
          diffs.splice(pointer, 1);
          break;
        }

        if (text_delete.length > 0 || text_insert.length > 0) {
          if (text_delete.length > 0 && text_insert.length > 0) {
            commonlength = diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if (previous_equality >= 0) {
                diffs[previous_equality][1] += text_insert.substring(0, commonlength);
              } else {
                diffs.splice(0, 0, [DIFF_EQUAL, text_insert.substring(0, commonlength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }

            commonlength = diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length - commonlength);
              text_delete = text_delete.substring(0, text_delete.length - commonlength);
            }
          }

          let n = count_insert + count_delete;
          if (text_delete.length === 0 && text_insert.length === 0) {
            diffs.splice(pointer - n, n);
            pointer = pointer - n;
          } else if (text_delete.length === 0) {
            diffs.splice(pointer - n, n, [DIFF_INSERT, text_insert]);
            pointer = pointer - n + 1;
          } else if (text_insert.length === 0) {
            diffs.splice(pointer - n, n, [DIFF_DELETE, text_delete]);
            pointer = pointer - n + 1;
          } else {
            diffs.splice(pointer - n, n, [DIFF_DELETE, text_delete], [DIFF_INSERT, text_insert]);
            pointer = pointer - n + 2;
          }
        }
        
        if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        
        count_insert = 0;
        count_delete = 0;
        text_delete = "";
        text_insert = "";
        break;
    }
  }

  if (diffs[diffs.length - 1][1] === "") {
    diffs.pop();
  }

  let changes = false;
  pointer = 1;
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
      if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) === diffs[pointer - 1][1]) {
        diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }

  if (changes) {
    diff_cleanupMerge(diffs, fix_unicode);
  }
}

function is_surrogate_pair_start(charCode) {
  return charCode >= 0xd800 && charCode <= 0xdbff;
}

function is_surrogate_pair_end(charCode) {
  return charCode >= 0xdc00 && charCode <= 0xdfff;
}

function starts_with_pair_end(str) {
  return is_surrogate_pair_end(str.charCodeAt(0));
}

function ends_with_pair_start(str) {
  return is_surrogate_pair_start(str.charCodeAt(str.length - 1));
}

function remove_empty_tuples(tuples) {
  return tuples.filter(tuple => tuple[1].length > 0);
}

function make_edit_splice(before, oldMiddle, newMiddle, after) {
  if (ends_with_pair_start(before) || starts_with_pair_end(after)) return null;
  return remove_empty_tuples([ [DIFF_EQUAL, before], [DIFF_DELETE, oldMiddle], [DIFF_INSERT, newMiddle], [DIFF_EQUAL, after] ]);
}

function find_cursor_edit_diff(oldText, newText, cursor_pos) {
  const oldRange = typeof cursor_pos === "number" ? { index: cursor_pos, length: 0 } : cursor_pos.oldRange;
  const newRange = typeof cursor_pos === "number" ? null : cursor_pos.newRange;

  if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
    const oldCursor = oldRange.index;
    const oldBefore = oldText.slice(0, oldCursor);
    const oldAfter = oldText.slice(oldCursor);
    const maybeNewCursor = newRange ? newRange.index : null;

    editBefore: {
      const newCursor = oldCursor + newText.length - oldText.length;
      if (maybeNewCursor !== null && maybeNewCursor !== newCursor) break editBefore;
      if (newCursor < 0 || newCursor > newText.length) break editBefore;
      const newBefore = newText.slice(0, newCursor);
      const newAfter = newText.slice(newCursor);

      if (newAfter !== oldAfter) break editBefore;
      const prefixLength = Math.min(oldCursor, newCursor);
      const oldPrefix = oldBefore.slice(0, prefixLength);
      const newPrefix = newBefore.slice(0, prefixLength);
      if (oldPrefix !== newPrefix) break editBefore;
      
      const oldMiddle = oldBefore.slice(prefixLength);
      const newMiddle = newBefore.slice(prefixLength);
      
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldAfter);
    }

    editAfter: {
      if (maybeNewCursor !== null && maybeNewCursor !== oldCursor) break editAfter;
      const cursor = oldCursor;
      const newBefore = newText.slice(0, cursor);
      const newAfter = newText.slice(cursor);

      if (newBefore !== oldBefore) break editAfter;
      const suffixLength = Math.min(oldText.length - cursor, newText.length - cursor);
      const oldSuffix = oldAfter.slice(oldAfter.length - suffixLength);
      const newSuffix = newAfter.slice(newAfter.length - suffixLength);
      if (oldSuffix !== newSuffix) break editAfter;

      const oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength);
      const newMiddle = newAfter.slice(0, newAfter.length - suffixLength);

      return make_edit_splice(oldBefore, oldMiddle, newMiddle, oldSuffix);
    }
  }

  if (oldRange.length > 0 && newRange && newRange.length === 0) {
    replaceRange: {
      const oldPrefix = oldText.slice(0, oldRange.index);
      const oldSuffix = oldText.slice(oldRange.index + oldRange.length);
      const prefixLength = oldPrefix.length;
      const suffixLength = oldSuffix.length;

      if (newText.length < prefixLength + suffixLength) break replaceRange;
      
      const newPrefix = newText.slice(0, prefixLength);
      const newSuffix = newText.slice(newText.length - suffixLength);

      if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) break replaceRange;
      
      const oldMiddle = oldText.slice(prefixLength, oldText.length - suffixLength);
      const newMiddle = newText.slice(prefixLength, newText.length - suffixLength);

      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
    }
  }

  return null;
}

diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;

module.exports = diff;
