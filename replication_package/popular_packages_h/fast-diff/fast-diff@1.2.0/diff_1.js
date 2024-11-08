const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

function diff_main(text1, text2, cursor_pos, _fix_unicode) {
    if (text1 === text2) return text1 ? [[DIFF_EQUAL, text1]] : [];

    if (cursor_pos != null) {
        let editdiff = find_cursor_edit_diff(text1, text2, cursor_pos);
        if (editdiff) return editdiff;
    }

    const commonprefix = text1.substring(0, diff_commonPrefix(text1, text2));
    text1 = text1.substring(commonprefix.length);
    text2 = text2.substring(commonprefix.length);

    const commonsuffix = text1.substring(text1.length - diff_commonSuffix(text1, text2));
    text1 = text1.substring(0, text1.length - commonsuffix.length);
    text2 = text2.substring(0, text2.length - commonsuffix.length);

    const diffs = diff_compute_(text1, text2);

    if (commonprefix) diffs.unshift([DIFF_EQUAL, commonprefix]);
    if (commonsuffix) diffs.push([DIFF_EQUAL, commonsuffix]);
    diff_cleanupMerge(diffs, _fix_unicode);

    return diffs;
}

function diff_compute_(text1, text2) {
    if (!text1) return [[DIFF_INSERT, text2]];
    if (!text2) return [[DIFF_DELETE, text1]];

    if (text1.includes(text2)) {
        return [
            [DIFF_INSERT, text1.replace(text2, '')],
            [DIFF_EQUAL, text2]
        ];
    }

    if (text2.includes(text1)) {
        return [
            [DIFF_EQUAL, text1],
            [DIFF_INSERT, text2.replace(text1, '')]
        ];
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

function diff_halfMatch_(text1, text2) {
    const longtext = text1.length > text2.length ? text1 : text2;
    const shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) return null;

    const check_half_match = (i) =>
        diff_halfMatchI_(longtext, shorttext, i);
    
    const hm1 = check_half_match(Math.ceil(longtext.length / 4));
    const hm2 = check_half_match(Math.ceil(longtext.length / 2));
    if (!hm1 && !hm2) return null;

    return hm1 && (!hm2 || (hm1[4].length > hm2[4].length)) ? hm1 : hm2;
}

function diff_halfMatchI_(longtext, shorttext, i) {
    const seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    let j = -1;
    let best_common = '', 
        best = [];
    
    while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
        const prefixLength = diff_commonPrefix(longtext.substring(i), shorttext.substring(j));
        const suffixLength = diff_commonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
        if (best_common.length < suffixLength + prefixLength) {
            best_common = shorttext.substring(j - suffixLength, j + prefixLength);
            best = [
                longtext.substring(0, i - suffixLength),
                longtext.substring(i + prefixLength),
                shorttext.substring(0, j - suffixLength),
                shorttext.substring(j + prefixLength)
            ];
        }
    }
    return best_common.length * 2 >= longtext.length ? [...best, best_common] : null;
}

function diff_bisect_(text1, text2) {
    const text1_length = text1.length;
    const text2_length = text2.length;
    const max_d = Math.ceil((text1_length + text2_length) / 2);
    const v_offset = max_d;
    const v_length = 2 * max_d;
    
    const v1 = Array(v_length).fill(-1),
          v2 = Array(v_length).fill(-1);
    
    v1[v_offset + 1] = v2[v_offset + 1] = 0;
    
    const delta = text1_length - text2_length;
    const front = (delta % 2 !== 0);
    let k1start = 0, k1end = 0, k2start = 0, k2end = 0;
    
    for (let d = 0; d < max_d; d++) {
        for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
            const k1_offset = v_offset + k1;
            const x1 = (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) ?
                v1[k1_offset + 1] : v1[k1_offset - 1] + 1;
            const y1 = x1 - k1;
            let x1_temp = x1;
            while (x1_temp < text1_length && y1 + x1_temp - x1 < text2_length &&
                text1[x1_temp] === text2[y1 + x1_temp - x1]) x1_temp++;
    
            v1[k1_offset] = x1_temp;
            if (x1_temp > text1_length) {
                k1end += 2;
            } else if (y1 + x1_temp - x1 > text2_length) {
                k1start += 2;
            } else if (front) {
                const k2_offset = v_offset + delta - k1;
                if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
                    const x2 = text1_length - v2[k2_offset];
                    if (x1_temp >= x2) return diff_bisectSplit_(text1, text2, x1_temp, y1 + x1_temp - x1);
                }
            }
        }
    
        for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
            const k2_offset = v_offset + k2;
            const x2 = (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) ?
                v2[k2_offset + 1] : v2[k2_offset - 1] + 1;
            const y2 = x2 - k2;
            let x2_temp = x2;
            while (x2_temp < text1_length && y2 + x2_temp - x2 < text2_length &&
                text1[text1_length - x2_temp - 1] === text2[text2_length - (y2 + x2_temp - x2) - 1]) x2_temp++;
    
            v2[k2_offset] = x2_temp;
            if (x2_temp > text1_length) {
                k2end += 2;
            } else if (y2 + x2_temp - x2 > text2_length) {
                k2start += 2;
            } else if (!front) {
                const k1_offset = v_offset + delta - k2;
                if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
                    const x1 = v1[k1_offset];
                    const x2_mirror = text1_length - x2_temp;
                    if (x1 >= x2_mirror) return diff_bisectSplit_(text1, text2, x1, v_offset + x1 - k1_offset);
                }
            }
        }
    }
    
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
}

function diff_bisectSplit_(text1, text2, x, y) {
    const diffs_a = diff_main(text1.substring(0, x), text2.substring(0, y));
    const diffs_b = diff_main(text1.substring(x), text2.substring(y));
    
    return diffs_a.concat(diffs_b);
}

function diff_cleanupMerge(diffs, fix_unicode) {
    diffs.push([DIFF_EQUAL, '']);
    let pointer = 0;
    let count_delete = 0, count_insert = 0;
    let text_delete = '', text_insert = '';

    while (pointer < diffs.length) {
        if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
            diffs.splice(pointer, 1);
            continue;
        }
        const [diff_type, diff_text] = diffs[pointer];
        switch (diff_type) {
            case DIFF_INSERT:
                count_insert++;
                text_insert += diff_text;
                pointer++;
                break;
            case DIFF_DELETE:
                count_delete++;
                text_delete += diff_text;
                pointer++;
                break;
            case DIFF_EQUAL:
                restore_equality_texts(pointer, diffs);
                let { previous_equality, commonlength } = find_common_parts(pointer, diffs, text_insert, text_delete, fix_unicode);
                pointer = merge_changes(pointer, diffs, count_insert, count_delete, text_insert, text_delete, previous_equality, commonlength);
                reset_counters();
                pointer++;
                break;
        }
    }
    if (diffs[diffs.length - 1][1] === '') diffs.pop();
    
    function restore_equality_texts(pointer, diffs) {
        const prev_equality = pointer - count_insert - count_delete - 1;
        if (fix_unicode) {
            if (prev_equality >= 0 && ends_with_pair_start(diffs[prev_equality][1])) {
                const stray = diffs[prev_equality][1].slice(-1);
                diffs[prev_equality][1] = diffs[prev_equality][1].slice(0, -1);
                text_delete = stray + text_delete;
                text_insert = stray + text_insert;
                if (!diffs[prev_equality][1]) {
                    align_to_previous_equality(prev_equality);
                }
            }
            if (starts_with_pair_end(diffs[pointer][1])) {
                const stray = diffs[pointer][1].charAt(0);
                diffs[pointer][1] = diffs[pointer][1].slice(1);
                text_delete += stray;
                text_insert += stray;
            }
        }
    }
    
    function align_to_previous_equality(prev_equality) {
        diffs.splice(prev_equality, 1);
        pointer--;
        let k = prev_equality - 1;
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

    function find_common_parts(pointer, diffs, text_insert, text_delete, fix_unicode) {
        let previous_equality = pointer - count_insert - count_delete - 1;
        const previous_equality_length = diffs.length;
        if (previous_equality >= previous_equality_length || !diffs[previous_equality] || !diffs[previous_equality][1]) {
            previous_equality = -1;
        }
        let commonlength = 0;
        if (text_delete.length > 0 && text_insert.length > 0) {
            commonlength = diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
                diffs = add_common_prefix(diffs, previous_equality, commonlength);
            }
            commonlength = diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
                diffs = move_common_suffix_to_end(diffs, pointer, text_insert, commonlength);
            }
        }
        return { previous_equality, commonlength };
    }

    function add_common_prefix(diffs, previous_equality, commonlength) {
        if (previous_equality >= 0) {
            diffs[previous_equality][1] += text_insert.substring(0, commonlength);
        } else {
            diffs.unshift([DIFF_EQUAL, text_insert.substring(0, commonlength)]);
            pointer++;
        }
        text_insert = text_insert.substring(commonlength);
        text_delete = text_delete.substring(commonlength);
        return diffs;
    }

    function move_common_suffix_to_end(diffs, pointer, text_insert, commonlength) {
        diffs[pointer][1] = 
            text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
        text_insert = text_insert.substring(0, text_insert.length - commonlength);
        text_delete = text_delete.substring(0, text_delete.length - commonlength);
        return diffs;
    }
    
    function merge_changes(pointer, diffs, count_insert, count_delete, text_insert, text_delete, previous_equality, commonlength) {
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
        return pointer;
    }

    function reset_counters() {
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
    }
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

function find_cursor_edit_diff(oldText, newText, cursor_pos) {
    let oldRange = typeof cursor_pos === 'number' ? 
        { index: cursor_pos, length: 0 } : cursor_pos.oldRange;
    let newRange = typeof cursor_pos === 'number' ? null : cursor_pos.newRange;

    if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
        let oldCursor = oldRange.index;
        let oldBefore = oldText.slice(0, oldCursor);
        let oldAfter = oldText.slice(oldCursor);

        if (tryEditBefore(oldText, newText, oldCursor, oldBefore, oldAfter, newRange)) {
            return;
        }

        if (tryEditAfter(oldText, newText, oldCursor, oldBefore, oldAfter, newRange)) {
            return;
        }
    }

    return tryReplaceRange(oldText, newText, oldRange, newRange);
}

function tryEditBefore(oldText, newText, oldCursor, oldBefore, oldAfter, maybeNewCursor) {
    let newCursor = oldCursor + newText.length - oldText.length;
    if (maybeNewCursor !== null && maybeNewCursor !== newCursor) return false;

    let newBefore = newText.slice(0, newCursor);
    if (newBefore !== oldBefore) return false;

    let newAfter = newText.slice(newCursor);
    if (newAfter !== oldAfter) return false;

    let prefixLength = Math.min(oldCursor, newCursor);
    let oldMiddle = oldBefore.slice(prefixLength);
    let newMiddle = newBefore.slice(prefixLength);
    return make_edit_splice(oldBefore.slice(0, prefixLength), oldMiddle, newMiddle, oldAfter);
}

function tryEditAfter(oldText, newText, oldCursor, oldBefore, oldAfter, maybeNewCursor) {
    let cursor = oldCursor;
    let newBefore = newText.slice(0, cursor);
    if (newBefore !== oldBefore) return false;

    let newAfter = newText.slice(cursor);
    if (!suffixEditMatches(oldAfter, newAfter)) return false;

    let oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength(oldAfter, newAfter));
    let newMiddle = newAfter.slice(0, newAfter.length - suffixLength(oldAfter, newAfter));
    return make_edit_splice(oldBefore, oldMiddle, newMiddle, newAfter.slice(newAfter.length - suffixLength(oldAfter, newAfter)));
}

function suffixEditMatches(oldAfter, newAfter) {
    let suffixLengthValue = suffixLength(oldAfter, newAfter);
    return oldAfter.slice(oldAfter.length - suffixLengthValue) === newAfter.slice(newAfter.length - suffixLengthValue);
}

function suffixLength(oldAfter, newAfter) {
    return Math.min(oldAfter.length, newAfter.length);
}

function tryReplaceRange(oldText, newText, oldRange, newRange) {
    if (oldRange.length > 0 && newRange && newRange.length === 0) {
        let oldPrefix = oldText.slice(0, oldRange.index);
        let oldSuffix = oldText.slice(oldRange.index + oldRange.length);
        let prefixLength = oldPrefix.length;
        let suffixLength = oldSuffix.length;
        if (newText.length < prefixLength + suffixLength) return null;

        let newPrefix = newText.slice(0, prefixLength);
        let newSuffix = newText.slice(newText.length - suffixLength);
        if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) return null;

        let oldMiddle = oldText.slice(prefixLength, oldText.length - suffixLength);
        let newMiddle = newText.slice(prefixLength, newText.length - suffixLength);
        return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
    }
    return null;
}

function diff_commonPrefix(text1, text2) {
    if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) return 0;
    let pointermin = 0;
    let pointermax = Math.min(text1.length, text2.length);
    let pointermid = pointermax;
    let pointerstart = 0;
    while (pointermin < pointermid) {
        if (text1.slice(pointerstart, pointermid) == text2.slice(pointerstart, pointermid)) {
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
        if (text1.slice(text1.length - pointermid, text1.length - pointerend) ==
            text2.slice(text2.length - pointermid, text2.length - pointerend)) {
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

function diff(text1, text2, cursor_pos) {
    return diff_main(text1, text2, cursor_pos, true);
}

diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;

module.exports = diff;
