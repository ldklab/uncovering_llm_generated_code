const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

function diff(text1, text2, cursor_pos) {
  return diff_main(text1, text2, cursor_pos, true);
}

function diff_main(text1, text2, cursor_pos, _fix_unicode) {
  if (text1 === text2) {
    return text1 ? [[DIFF_EQUAL, text1]] : [];
  }

  if (cursor_pos != null) {
    const editdiff = find_cursor_edit_diff(text1, text2, cursor_pos);
    if (editdiff) return editdiff;
  }

  const commonprefix = get_common_prefix(text1, text2);
  text1 = text1.slice(commonprefix.length);
  text2 = text2.slice(commonprefix.length);

  const commonsuffix = get_common_suffix(text1, text2);
  text1 = text1.slice(0, text1.length - commonsuffix.length);
  text2 = text2.slice(0, text2.length - commonsuffix.length);

  const diffs = compute_diff(text1, text2);

  if (commonprefix) {
    diffs.unshift([DIFF_EQUAL, commonprefix]);
  }
  if (commonsuffix) {
    diffs.push([DIFF_EQUAL, commonsuffix]);
  }
  cleanup_merge(diffs, _fix_unicode);
  return diffs;
}

function compute_diff(text1, text2) {
  if (!text1) return [[DIFF_INSERT, text2]];
  if (!text2) return [[DIFF_DELETE, text1]];

  const longtext = text1.length > text2.length ? text1 : text2;
  const shorttext = text1.length > text2.length ? text2 : text1;
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

  const hm = find_half_match(text1, text2);
  if (hm) {
    const [text1_a, text1_b, text2_a, text2_b, mid_common] = hm;
    const diffs_a = diff_main(text1_a, text2_a);
    const diffs_b = diff_main(text1_b, text2_b);
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }

  return diff_bisect(text1, text2);
}

function diff_bisect(text1, text2) {
  const text1_length = text1.length;
  const text2_length = text2.length;
  const max_d = Math.ceil((text1_length + text2_length) / 2);
  const v_offset = max_d;
  const v_length = 2 * max_d;
  const v1 = new Array(v_length).fill(-1);
  const v2 = new Array(v_length).fill(-1);
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  const delta = text1_length - text2_length;
  const front = (delta % 2 !== 0);

  for (let d = 0; d < max_d; d++) {
    for (let k1 = -d; k1 <= d; k1 += 2) {
      const k1_offset = v_offset + k1;
      let x1;
      x1 = k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1]) ? v1[k1_offset + 1] : v1[k1_offset - 1] + 1;
      let y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) === text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        continue;
      } else if (y1 > text2_length) {
        continue;
      } else if (front) {
        const k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
          const x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) {
            return bisect_split(text1, text2, x1, y1);
          }
        }
      }
    }

    for (let k2 = -d; k2 <= d; k2 += 2) {
      const k2_offset = v_offset + k2;
      let x2;
      x2 = k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1]) ? v2[k2_offset + 1] : v2[k2_offset - 1] + 1;
      let y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) === text2.charAt(text2_length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        continue;
      } else if (y2 > text2_length) {
        continue;
      } else if (!front) {
        const k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
          const x1 = v1[k1_offset];
          const y1 = v_offset + x1 - k1_offset;
          x2 = text1_length - x2;
          if (x1 >= x2) {
            return bisect_split(text1, text2, x1, y1);
          }
        }
      }
    }
  }
  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
}

function bisect_split(text1, text2, x, y) {
  const text1a = text1.slice(0, x);
  const text2a = text2.slice(0, y);
  const text1b = text1.slice(x);
  const text2b = text2.slice(y);
  const diffs = diff_main(text1a, text2a);
  const diffsb = diff_main(text1b, text2b);
  return diffs.concat(diffsb);
}

function get_common_prefix(text1, text2) {
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
    return '';
  }

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

  if (is_surrogate_pair_start(text1.charCodeAt(pointermid - 1))) {
    pointermid--;
  }

  return text1.slice(0, pointermid);
}

function get_common_suffix(text1, text2) {
  if (!text1 || !text2 || text1.slice(-1) !== text2.slice(-1)) {
    return '';
  }

  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.slice(text1.length - pointermid, text1.length - pointerend) === text2.slice(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (is_surrogate_pair_end(text1.charCodeAt(text1.length - pointermid))) {
    pointermid--;
  }

  return text1.slice(text1.length - pointermid);
}

function find_half_match(text1, text2) {
  const longtext = text1.length > text2.length ? text1 : text2;
  const shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null;
  }

  const hm1 = half_match_internal(longtext, shorttext, Math.ceil(longtext.length / 4));
  const hm2 = half_match_internal(longtext, shorttext, Math.ceil(longtext.length / 2));
  const hm = !hm1 && !hm2 ? null : (!hm2 || (hm1 && hm1[4].length > hm2[4].length)) ? hm1 : hm2;

  if (!hm) return null;

  const text1_a = text1.length > text2.length ? hm[0] : hm[2];
  const text1_b = text1.length > text2.length ? hm[1] : hm[3];
  const text2_a = text1.length > text2.length ? hm[2] : hm[0];
  const text2_b = text1.length > text2.length ? hm[3] : hm[1];
  const mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
}

function half_match_internal(longtext, shorttext, i) {
  const seed = longtext.slice(i, i + Math.floor(longtext.length / 4));
  let j = -1;
  let best_common = '';
  let best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
  while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
    const prefixLength = get_common_prefix(longtext.slice(i), shorttext.slice(j));
    const suffixLength = get_common_suffix(longtext.slice(0, i), shorttext.slice(0, j));
    if (best_common.length < suffixLength + prefixLength) {
      best_common = shorttext.slice(j - suffixLength, j) + shorttext.slice(j, j + prefixLength);
      best_longtext_a = longtext.slice(0, i - suffixLength);
      best_longtext_b = longtext.slice(i + prefixLength);
      best_shorttext_a = shorttext.slice(0, j - suffixLength);
      best_shorttext_b = shorttext.slice(j + prefixLength);
    }
  }
  return best_common.length * 2 >= longtext.length ? [best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b, best_common] : null;
}

function find_cursor_edit_diff(oldText, newText, cursor_pos) {
  const oldRange = typeof cursor_pos === 'number' ? { index: cursor_pos, length: 0 } : cursor_pos.oldRange;
  const newRange = typeof cursor_pos === 'number' ? null : cursor_pos.newRange;

  const oldLength = oldText.length;
  const newLength = newText.length;

  if (oldRange.length === 0 && (!newRange || newRange.length === 0)) {
    const oldCursor = oldRange.index;
    const oldBefore = oldText.slice(0, oldCursor);
    const oldAfter = oldText.slice(oldCursor);
    const maybeNewCursor = newRange ? newRange.index : null;
    const newCursor = oldCursor + newLength - oldLength;
    if (maybeNewCursor === null || maybeNewCursor === newCursor) {
      if (newCursor >= 0 && newCursor <= newLength) {
        const newBefore = newText.slice(0, newCursor);
        const newAfter = newText.slice(newCursor);
        if (newAfter === oldAfter) {
          const prefixLength = Math.min(oldCursor, newCursor);
          const oldPrefix = oldBefore.slice(0, prefixLength);
          const newPrefix = newBefore.slice(0, prefixLength);
          if (oldPrefix === newPrefix) {
            const oldMiddle = oldBefore.slice(prefixLength);
            const newMiddle = newBefore.slice(prefixLength);
            return build_edit_splice(oldPrefix, oldMiddle, newMiddle, oldAfter);
          }
        }
      }
    }

    if (maybeNewCursor === null || maybeNewCursor === oldCursor) {
      const cursor = oldCursor;
      const newBefore = newText.slice(0, cursor);
      const newAfter = newText.slice(cursor);
      if (newBefore === oldBefore) {
        const suffixLength = Math.min(oldLength - cursor, newLength - cursor);
        const oldSuffix = oldAfter.slice(oldAfter.length - suffixLength);
        const newSuffix = newAfter.slice(newAfter.length - suffixLength);
        if (oldSuffix === newSuffix) {
          const oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength);
          const newMiddle = newAfter.slice(0, newAfter.length - suffixLength);
          return build_edit_splice(oldBefore, oldMiddle, newMiddle, oldSuffix);
        }
      }
    }
  }
  
  if (oldRange.length > 0 && newRange && newRange.length === 0) {
    const oldPrefix = oldText.slice(0, oldRange.index);
    const oldSuffix = oldText.slice(oldRange.index + oldRange.length);
    const prefixLength = oldPrefix.length;
    const suffixLength = oldSuffix.length;
    if (newLength >= prefixLength + suffixLength) {
      const newPrefix = newText.slice(0, prefixLength);
      const newSuffix = newText.slice(newLength - suffixLength);
      if (oldPrefix === newPrefix && oldSuffix === newSuffix) {
        const oldMiddle = oldText.slice(prefixLength, oldLength - suffixLength);
        const newMiddle = newText.slice(prefixLength, newLength - suffixLength);
        return build_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
      }
    }
  }

  return null;
}

function build_edit_splice(before, oldMiddle, newMiddle, after) {
  if (ends_with_pair_start(before) || starts_with_pair_end(after)) {
    return null;
  }
  return remove_empty_tuples([
    [DIFF_EQUAL, before],
    [DIFF_DELETE, oldMiddle],
    [DIFF_INSERT, newMiddle],
    [DIFF_EQUAL, after]
  ]);
}

function cleanup_merge(diffs, fix_unicode) {
  diffs.push([DIFF_EQUAL, '']);
  let pointer = 0;
  let count_delete = 0;
  let count_insert = 0;
  let text_delete = '';
  let text_insert = '';
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
            const stray = diffs[previous_equality][1].slice(-1);
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
        if (text_delete.length > 0 || text_insert.length > 0) {
          if (text_delete.length > 0 && text_insert.length > 0) {
            commonlength = get_common_prefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if (previous_equality >= 0) {
                diffs[previous_equality][1] += text_insert.slice(0, commonlength);
              } else {
                diffs.unshift([DIFF_EQUAL, text_insert.slice(0, commonlength)]);
                pointer++;
              }
              text_insert = text_insert.slice(commonlength);
              text_delete = text_delete.slice(commonlength);
            }
            commonlength = get_common_suffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.slice(-commonlength) + diffs[pointer][1];
              text_insert = text_insert.slice(0, -commonlength);
              text_delete = text_delete.slice(0, -commonlength);
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

  if (diffs[diffs.length - 1][1] === '') {
    diffs.pop();
  }

  let changes = false;
  pointer = 1;

  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
      if (diffs[pointer][1].slice(-diffs[pointer - 1][1].length) === diffs[pointer - 1][1]) {
        diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].slice(0, -diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].slice(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] = diffs[pointer][1].slice(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }

  if (changes) cleanup_merge(diffs, fix_unicode);
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

diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;

module.exports = diff;
