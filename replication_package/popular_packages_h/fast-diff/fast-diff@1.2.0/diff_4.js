const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

/**
 * Finds differences between two texts and returns them as diff tuples.
 * @param {string} text1 - The original string.
 * @param {string} text2 - The modified string.
 * @param {number|Object} [cursor_pos] - Optional edit position or object with more info.
 * @param {boolean} [_fix_unicode] - Internal flag to handle Unicode corrections.
 * @returns {Array} - Array of diff tuples.
 */
function diff_main(text1, text2, cursor_pos, _fix_unicode) {
  if (text1 === text2) return text1 ? [[DIFF_EQUAL, text1]] : [];

  if (cursor_pos != null) {
    const editdiff = find_cursor_edit_diff(text1, text2, cursor_pos);
    if (editdiff) return editdiff;
  }

  const commonLengthPrefix = diff_commonPrefix(text1, text2);
  const commonPrefix = text1.substring(0, commonLengthPrefix);
  text1 = text1.substring(commonLengthPrefix);
  text2 = text2.substring(commonLengthPrefix);

  const commonLengthSuffix = diff_commonSuffix(text1, text2);
  const commonSuffix = text1.substring(text1.length - commonLengthSuffix);
  text1 = text1.substring(0, text1.length - commonLengthSuffix);
  text2 = text2.substring(0, text2.length - commonLengthSuffix);

  const diffs = diff_compute_(text1, text2);

  if (commonPrefix) diffs.unshift([DIFF_EQUAL, commonPrefix]);
  if (commonSuffix) diffs.push([DIFF_EQUAL, commonSuffix]);

  diff_cleanupMerge(diffs, _fix_unicode);
  return diffs;
}

function diff_compute_(text1, text2) {
  if (!text1) return [[DIFF_INSERT, text2]];
  if (!text2) return [[DIFF_DELETE, text1]];

  const longText = text1.length > text2.length ? text1 : text2;
  const shortText = text1.length > text2.length ? text2 : text1;
  const i = longText.indexOf(shortText);
  if (i !== -1) {
    const diffs = [
      [DIFF_INSERT, longText.substring(0, i)],
      [DIFF_EQUAL, shortText],
      [DIFF_INSERT, longText.substring(i + shortText.length)]
    ];
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shortText.length === 1) {
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  const hm = diff_halfMatch_(text1, text2);
  if (hm) {
    const [text1_a, text1_b, text2_a, text2_b, mid_common] = hm;
    const diffs_a = diff_main(text1_a, text2_a);
    const diffs_b = diff_main(text1_b, text2_b);
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }

  return diff_bisect_(text1, text2);
}

function diff_bisect_(text1, text2) {
  const text1_length = text1.length;
  const text2_length = text2.length;
  const max_d = Math.ceil((text1_length + text2_length) / 2);
  const v_offset = max_d;
  const v_length = 2 * max_d;
  const v1 = Array(v_length).fill(-1);
  const v2 = Array(v_length).fill(-1);
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  const delta = text1_length - text2_length;
  const front = (delta % 2 !== 0);
  let k1start = 0;
  let k1end = 0;
  let k2start = 0;
  let k2end = 0;
  for (let d = 0; d < max_d; d++) {
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      const k1_offset = v_offset + k1;
      let x1;
      if (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      let y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) === text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) k1end += 2;
      else if (y1 > text2_length) k1start += 2;
      else if (front) {
        const k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
          const x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) return diff_bisectSplit_(text1, text2, x1, y1);
        }
      }
    }

    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const k2_offset = v_offset + k2;
      let x2;
      if (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      let y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) === text2.charAt(text2_length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) k2end += 2;
      else if (y2 > text2_length) k2start += 2;
      else if (!front) {
        const k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
          const x1 = v1[k1_offset];
          const y1 = v_offset + x1 - k1_offset;
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

function diff_commonPrefix(text1, text2) {
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) return 0;

  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (is_surrogate_pair_start(text1.charCodeAt(pointermid - 1))) pointermid--;

  return pointermid;
}

function diff_commonSuffix(text1, text2) {
  if (!text1 || !text2 || text1.slice(-1) !== text2.slice(-1)) return 0;

  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (is_surrogate_pair_end(text1.charCodeAt(text1.length - pointermid))) pointermid--;

  return pointermid;
}

function diff_halfMatch_(text1, text2) {
  const longText = text1.length > text2.length ? text1 : text2;
  const shortText = text1.length > text2.length ? text2 : text1;
  if (longText.length < 4 || shortText.length * 2 < longText.length) return null;

  function diff_halfMatchI_(longText, shortText, i) {
    const seed = longText.substring(i, i + Math.floor(longText.length / 4));
    let j = -1;
    let bestCommon = '';
    let best_longText_a, best_longText_b, best_shortText_a, best_shortText_b;
    while ((j = shortText.indexOf(seed, j + 1)) !== -1) {
      const prefixLength = diff_commonPrefix(longText.substring(i), shortText.substring(j));
      const suffixLength = diff_commonSuffix(longText.substring(0, i), shortText.substring(0, j));
      if (bestCommon.length < suffixLength + prefixLength) {
        bestCommon = shortText.substring(j - suffixLength, j) + shortText.substring(j, j + prefixLength);
        best_longText_a = longText.substring(0, i - suffixLength);
        best_longText_b = longText.substring(i + prefixLength);
        best_shortText_a = shortText.substring(0, j - suffixLength);
        best_shortText_b = shortText.substring(j + prefixLength);
      }
    }
    if (bestCommon.length * 2 >= longText.length) {
      return [best_longText_a, best_longText_b, best_shortText_a, best_shortText_b, bestCommon];
    }
    return null;
  }

  const hm1 = diff_halfMatchI_(longText, shortText, Math.ceil(longText.length / 4));
  const hm2 = diff_halfMatchI_(longText, shortText, Math.ceil(longText.length / 2));
  if (!hm1 && !hm2) return null;
  const hm = !hm2 || hm1 && hm1[4].length > hm2[4].length ? hm1 : hm2;

  const [text1_a, text1_b, text2_a, text2_b] = text1.length > text2.length ? hm.slice(0, 4) : [hm[2], hm[3], hm[0], hm[1]];
  return [text1_a, text1_b, text2_a, text2_b, hm[4]];
}

function diff_cleanupMerge(diffs, fix_unicode) {
  diffs.push([DIFF_EQUAL, '']);
  let pointer = 0;
  let count_delete = 0;
  let count_insert = 0;
  let text_delete = '';
  let text_insert = '';
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
        const prev_eq = pointer - count_insert - count_delete - 1;
        if (fix_unicode) {
          if (prev_eq >= 0 && ends_with_pair_start(diffs[prev_eq][1])) {
            const stray = diffs[prev_eq][1].slice(-1);
            diffs[prev_eq][1] = diffs[prev_eq][1].slice(0, -1);
            text_delete = stray + text_delete;
            text_insert = stray + text_insert;
            if (!diffs[prev_eq][1]) {
              diffs.splice(prev_eq, 1);
              pointer--;
              let k = prev_eq - 1;
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
            }
          }
          if (starts_with_pair_end(diffs[pointer][1])) {
            const stray = diffs[pointer][1].charAt(0);
            diffs[pointer][1] = diffs[pointer][1].slice(1);
            text_delete += stray;
            text_insert += stray;
          }
        }
        if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
          diffs.splice(pointer, 1);
          break;
        }
        let commonLength;
        if (text_delete.length > 0 || text_insert.length > 0) {
          if (text_delete.length > 0 && text_insert.length > 0) {
            commonLength = diff_commonPrefix(text_insert, text_delete);
            if (commonLength !== 0) {
              if (prev_eq >= 0) {
                diffs[prev_eq][1] += text_insert.substring(0, commonLength);
              } else {
                diffs.splice(0, 0, [DIFF_EQUAL, text_insert.substring(0, commonLength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonLength);
              text_delete = text_delete.substring(commonLength);
            }
            commonLength = diff_commonSuffix(text_insert, text_delete);
            if (commonLength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length - commonLength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length - commonLength);
              text_delete = text_delete.substring(0, text_delete.length - commonLength);
            }
          }
          const n = count_insert + count_delete;
          if (text_delete.length === 0 && text_insert.length === 0) {
            diffs.splice(pointer - n, n);
            pointer -= n;
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
        text_delete = '';
        text_insert = '';
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === '') diffs.pop();

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
  if (changes) diff_cleanupMerge(diffs, fix_unicode);
}

function is_surrogate_pair_start(charCode) {
  return charCode >= 0xD800 && charCode <= 0xDBFF;
}

function is_surrogate_pair_end(charCode) {
  return charCode >= 0xDC00 && charCode <= 0xDFFF;
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
  return remove_empty_tuples([
    [DIFF_EQUAL, before],
    [DIFF_DELETE, oldMiddle],
    [DIFF_INSERT, newMiddle],
    [DIFF_EQUAL, after]
  ]);
}

function find_cursor_edit_diff(oldText, newText, cursor_pos) {
  const oldRange = typeof cursor_pos === 'number' ? { index: cursor_pos, length: 0 } : cursor_pos.oldRange;
  const newRange = typeof cursor_pos === 'number' ? null : cursor_pos.newRange;
  
  const oldLength = oldText.length;
  const newLength = newText.length;
  
  if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
    const oldCursor = oldRange.index;
    const oldBefore = oldText.slice(0, oldCursor);
    const oldAfter = oldText.slice(oldCursor);
    const maybeNewCursor = newRange ? newRange.index : null;

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
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldAfter);
    }

    editAfter: {
      if (maybeNewCursor !== null && maybeNewCursor !== oldCursor) break editAfter;
      const cursor = oldCursor;
      const newBefore = newText.slice(0, cursor);
      const newAfter = newText.slice(cursor);
      if (newBefore !== oldBefore) break editAfter;
      const suffixLength = Math.min(oldLength - cursor, newLength - cursor);
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
      if (newLength < prefixLength + suffixLength) break replaceRange;
      const newPrefix = newText.slice(0, prefixLength);
      const newSuffix = newText.slice(newLength - suffixLength);
      if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) break replaceRange;
      const oldMiddle = oldText.slice(prefixLength, oldLength - suffixLength);
      const newMiddle = newText.slice(prefixLength, newLength - suffixLength);
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
    }
  }

  return null;
}

function diff(text1, text2, cursor_pos) {
  return diff_main(text1, text2, cursor_pos, true);
}

diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;

module.exports = diff;
