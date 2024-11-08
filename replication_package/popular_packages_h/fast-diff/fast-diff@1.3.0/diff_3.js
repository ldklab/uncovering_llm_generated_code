var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;

function diff_main(text1, text2, cursor_pos, cleanup, _fix_unicode) {
  if (text1 === text2) {
    return text1 ? [[DIFF_EQUAL, text1]] : [];
  }

  if (cursor_pos != null) {
    var editdiff = find_cursor_edit_diff(text1, text2, cursor_pos);
    if (editdiff) return editdiff;
  }

  var commonprefix = text1.substring(0, diff_commonPrefix(text1, text2));
  text1 = text1.substring(commonprefix.length);
  text2 = text2.substring(commonprefix.length);

  var commonsuffix = text1.substring(text1.length - diff_commonSuffix(text1, text2));
  text1 = text1.substring(0, text1.length - commonsuffix.length);
  text2 = text2.substring(0, text2.length - commonsuffix.length);

  var diffs = diff_compute_(text1, text2);

  if (commonprefix) diffs.unshift([DIFF_EQUAL, commonprefix]);
  if (commonsuffix) diffs.push([DIFF_EQUAL, commonsuffix]);

  diff_cleanupMerge(diffs, _fix_unicode);
  if (cleanup) diff_cleanupSemantic(diffs);

  return diffs;
}

function diff_compute_(text1, text2) {
  if (!text1) return [[DIFF_INSERT, text2]];
  if (!text2) return [[DIFF_DELETE, text1]];

  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  var i = longtext.indexOf(shorttext);
  if (i !== -1) {
    var diffs = [
      [DIFF_INSERT, longtext.substring(0, i)],
      [DIFF_EQUAL, shorttext],
      [DIFF_INSERT, longtext.substring(i + shorttext.length)],
    ];
    if (text1.length > text2.length) diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    return diffs;
  }

  if (shorttext.length === 1) {
    return [
      [DIFF_DELETE, text1],
      [DIFF_INSERT, text2],
    ];
  }

  var hm = diff_halfMatch_(text1, text2);
  if (hm) {
    var diffs_a = diff_main(hm[0], hm[2]);
    var diffs_b = diff_main(hm[1], hm[3]);
    return diffs_a.concat([[DIFF_EQUAL, hm[4]]], diffs_b);
  }

  return diff_bisect_(text1, text2);
}

function diff_bisect_(text1, text2) {
  var text1_length = text1.length, text2_length = text2.length;
  var max_d = Math.ceil((text1_length + text2_length) / 2);
  var delta = text1_length - text2_length;
  var v_offset = max_d, v_length = 2 * max_d;
  var v1 = Array(v_length).fill(-1), v2 = Array(v_length).fill(-1);
  v1[v_offset + 1] = 0, v2[v_offset + 1] = 0;

  for (var d = 0; d < max_d; d++) {
    for (var k1 = -d; k1 <= d; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1 = (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) 
        ? v1[k1_offset + 1] 
        : v1[k1_offset - 1] + 1;
      var y1 = x1 - k1;
      while (
        x1 < text1_length &&
        y1 < text2_length &&
        text1.charAt(x1) === text2.charAt(y1)
      ) { x1++; y1++; }
      v1[k1_offset] = x1;

      if (x1 > text1_length) continue;
      if (y1 > text2_length) continue;

      var k2_offset = v_offset + delta - k1;
      if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
        var x2 = text1_length - v2[k2_offset];
        if (x1 >= x2) return diff_bisectSplit_(text1, text2, x1, y1);
      }
    }

    for (var k2 = -d; k2 <= d; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2 = (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) 
        ? v2[k2_offset + 1] 
        : v2[k2_offset - 1] + 1;
      var y2 = x2 - k2;
      while (
        x2 < text1_length &&
        y2 < text2_length &&
        text1.charAt(text1_length - x2 - 1) === text2.charAt(text2_length - y2 - 1)
      ) { x2++; y2++; }
      v2[k2_offset] = x2;

      if (x2 > text1_length || y2 > text2_length) continue;

      var k1_offset = v_offset + delta - k2;
      if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
        var x1 = v1[k1_offset];
        var y1 = v_offset + x1 - k1_offset;
        if (x1 >= text1_length - x2) return diff_bisectSplit_(text1, text2, x1, y1);
      }
    }
  }
  return [
    [DIFF_DELETE, text1],
    [DIFF_INSERT, text2],
  ];
}

function diff_bisectSplit_(text1, text2, x, y) {
  var text1a = text1.substring(0, x), text2a = text2.substring(0, y);
  var text1b = text1.substring(x), text2b = text2.substring(y);

  var diffs = diff_main(text1a, text2a);
  var diffsb = diff_main(text1b, text2b);

  return diffs.concat(diffsb);
}

function diff_commonPrefix(text1, text2) {
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) return 0;
  var pointermin = 0, pointermax = Math.min(text1.length, text2.length), pointermid = pointermax, pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid)) {
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
  var pointermin = 0, pointermax = Math.min(text1.length, text2.length), pointermid = pointermax, pointerend = 0;
  while (pointermin < pointermid) {
    if (
      text1.substring(text1.length - pointermid, text1.length - pointerend) ==
      text2.substring(text2.length - pointermid, text2.length - pointerend)
    ) {
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
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) return null;

  function diff_halfMatchI_(longtext, shorttext, i) {
    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    var j = -1, best_common = "", best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
      var prefixLength = diff_commonPrefix(longtext.substring(i), shorttext.substring(j));
      var suffixLength = diff_commonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
      if (best_common.length < suffixLength + prefixLength) {
        best_common = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext.length) {
      return [best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b, best_common];
    } else {
      return null;
    }
  }

  var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
  var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
  var hm = !hm1 ? hm2 : (!hm2 ? hm1 : (hm1[4].length > hm2[4].length ? hm1 : hm2));

  if (!hm) return null;

  return text1.length > text2.length 
    ? [hm[0], hm[1], hm[2], hm[3], hm[4]]
    : [hm[2], hm[3], hm[0], hm[1], hm[4]];
}

function diff_cleanupSemantic(diffs) {
  var changes = false;
  var equalities = [];
  var equalitiesLength = 0;
  var lastequality = null;
  var pointer = 0;
  var length_insertions1 = 0, length_deletions1 = 0;
  var length_insertions2 = 0, length_deletions2 = 0;
  
  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastequality = diffs[pointer][1];
    } else {
      if (diffs[pointer][0] == DIFF_INSERT) length_insertions2 += diffs[pointer][1].length;
      else length_deletions2 += diffs[pointer][1].length;

      if (
        lastequality &&
        lastequality.length <= Math.max(length_insertions1, length_deletions1) &&
        lastequality.length <= Math.max(length_insertions2, length_deletions2)
      ) {
        diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
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
      var deletion = diffs[pointer - 1][1];
      var insertion = diffs[pointer][1];
      var overlap_length1 = diff_commonOverlap_(deletion, insertion);
      var overlap_length2 = diff_commonOverlap_(insertion, deletion);
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
  function diff_cleanupSemanticScore_(one, two) {
    if (!one || !two) return 6;

    var char1 = one.charAt(one.length - 1);
    var char2 = two.charAt(0);
    var nonAlphaNumeric1 = char1.match(nonAlphaNumericRegex_);
    var nonAlphaNumeric2 = char2.match(nonAlphaNumericRegex_);
    var whitespace1 = nonAlphaNumeric1 && char1.match(whitespaceRegex_);
    var whitespace2 = nonAlphaNumeric2 && char2.match(whitespaceRegex_);
    var lineBreak1 = whitespace1 && char1.match(linebreakRegex_);
    var lineBreak2 = whitespace2 && char2.match(linebreakRegex_);
    var blankLine1 = lineBreak1 && one.match(blanklineEndRegex_);
    var blankLine2 = lineBreak2 && two.match(blanklineStartRegex_);

    return blankLine1 || blankLine2 ? 5 : 
           (lineBreak1 || lineBreak2) ? 4 : 
           (nonAlphaNumeric1 && !whitespace1 && whitespace2) ? 3 : 
           (whitespace1 || whitespace2) ? 2 : 
           (nonAlphaNumeric1 || nonAlphaNumeric2) ? 1 : 0;
  }

  var pointer = 1;
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
      var equality1 = diffs[pointer - 1][1];
      var edit = diffs[pointer][1];
      var equality2 = diffs[pointer + 1][1];

      var commonOffset = diff_commonSuffix(equality1, edit);
      if (commonOffset) {
        var commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }

      var bestEquality1 = equality1, bestEdit = edit, bestEquality2 = equality2;
      var bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        var score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }

      if (diffs[pointer - 1][1] != bestEquality1) {
        if (bestEquality1) diffs[pointer - 1][1] = bestEquality1;
        else { diffs.splice(pointer - 1, 1); pointer--; }
        diffs[pointer][1] = bestEdit;
        if (bestEquality2) diffs[pointer + 1][1] = bestEquality2;
        else { diffs.splice(pointer + 1, 1); pointer--; }
      }
    }
    pointer++;
  }
}

function diff_cleanupMerge(diffs, fix_unicode) {
  diffs.push([DIFF_EQUAL, ""]);
  var pointer = 0, count_delete = 0, count_insert = 0;
  var text_delete = "", text_insert = "";
  var commonlength;
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
        var previous_equality = pointer - count_insert - count_delete - 1;
        if (fix_unicode) {
          if (
            previous_equality >= 0 &&
            ends_with_pair_start(diffs[previous_equality][1])
          ) {
            var stray = diffs[previous_equality][1].slice(-1);
            diffs[previous_equality][1] = diffs[previous_equality][1].slice(0, -1);
            text_delete = stray + text_delete;
            text_insert = stray + text_insert;
            if (!diffs[previous_equality][1]) {
              diffs.splice(previous_equality, 1);
              pointer--;
              var k = previous_equality - 1;
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
            var stray = diffs[pointer][1].charAt(0);
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
          var n = count_insert + count_delete;
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
  if (diffs[diffs.length - 1][1] === "") diffs.pop();

  var changes = false;
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
  return remove_empty_tuples([
    [DIFF_EQUAL, before],
    [DIFF_DELETE, oldMiddle],
    [DIFF_INSERT, newMiddle],
    [DIFF_EQUAL, after],
  ]);
}

function find_cursor_edit_diff(oldText, newText, cursor_pos) {
  var oldRange = typeof cursor_pos === "number" ? { index: cursor_pos, length: 0 } : cursor_pos.oldRange;
  var newRange = typeof cursor_pos === "number" ? null : cursor_pos.newRange;

  if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
    var oldCursor = oldRange.index;
    var oldBefore = oldText.slice(0, oldCursor);
    var oldAfter = oldText.slice(oldCursor);
    var maybeNewCursor = newRange ? newRange.index : null;
    editBefore: {
      var newCursor = oldCursor + newLength - oldLength;
      if (maybeNewCursor !== null && maybeNewCursor !== newCursor) break editBefore;
      if (newCursor < 0 || newCursor > newLength) break editBefore;
      var newBefore = newText.slice(0, newCursor);
      var newAfter = newText.slice(newCursor);
      if (newAfter !== oldAfter) break editBefore;
      var prefixLength = Math.min(oldCursor, newCursor);
      var oldPrefix = oldBefore.slice(0, prefixLength);
      var newPrefix = newBefore.slice(0, prefixLength);
      if (oldPrefix !== newPrefix) break editBefore;
      var oldMiddle = oldBefore.slice(prefixLength);
      var newMiddle = newBefore.slice(prefixLength);
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldAfter);
    }
    editAfter: {
      if (maybeNewCursor !== null && maybeNewCursor !== oldCursor) break editAfter;
      var cursor = oldCursor;
      var newBefore = newText.slice(0, cursor);
      var newAfter = newText.slice(cursor);
      if (newBefore !== oldBefore) break editAfter;
      var suffixLength = Math.min(oldLength - cursor, newLength - cursor);
      var oldSuffix = oldAfter.slice(oldAfter.length - suffixLength);
      var newSuffix = newAfter.slice(newAfter.length - suffixLength);
      if (oldSuffix !== newSuffix) break editAfter;
      var oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength);
      var newMiddle = newAfter.slice(0, newAfter.length - suffixLength);
      return make_edit_splice(oldBefore, oldMiddle, newMiddle, oldSuffix);
    }
  }
  if (oldRange.length > 0 && newRange && newRange.length === 0) {
    replaceRange: {
      var oldPrefix = oldText.slice(0, oldRange.index);
      var oldSuffix = oldText.slice(oldRange.index + oldRange.length);
      var prefixLength = oldPrefix.length;
      var suffixLength = oldSuffix.length;
      if (newLength < prefixLength + suffixLength) break replaceRange;
      var newPrefix = newText.slice(0, prefixLength);
      var newSuffix = newText.slice(newLength - suffixLength);
      if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) break replaceRange;
      var oldMiddle = oldText.slice(prefixLength, oldLength - suffixLength);
      var newMiddle = newText.slice(prefixLength, newLength - suffixLength);
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
    }
  }
  return null;
}

function diff(text1, text2, cursor_pos, cleanup) {
  return diff_main(text1, text2, cursor_pos, cleanup, true);
}

diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;

module.exports = diff;
