// balanced-match.js

/**
 * Main function to locate balanced matches between delimiters in a string.
 * 
 * @param {*} a - Opening delimiter, string or regex.
 * @param {*} b - Closing delimiter, string or regex.
 * @param {string} str - Input string for matching.
 * @returns {Object|undefined} - Object with indices and substrings if matched.
 */
function balanced(a, b, str) {
    const range = findRange(a, b, str);
    return range ? constructResult(range, a, b, str) : undefined;
}

/**
 * Constructs the result object with delimiters' match details.
 * 
 * @param {[number, number]} range - Start and end index of matched range.
 * @param {*} a - Opening delimiter.
 * @param {*} b - Closing delimiter.
 * @param {string} str - Original input string.
 * @returns {Object} - Object detailing indices and substrings.
 */
function constructResult(range, a, b, str) {
    return {
        start: range[0],
        end: range[1],
        pre: str.slice(0, range[0]),
        body: str.slice(range[0] + matchLength(a, range[0]), range[1]),
        post: str.slice(range[1] + matchLength(b, range[1]))
    };
}

/**
 * Finds the first balanced match range.
 * 
 * @param {*} a - Opening delimiter, string or regex.
 * @param {*} b - Closing delimiter, string or regex.
 * @param {string} str - String to search in.
 * @returns {[number, number]|undefined} - Start and end indices of match.
 */
function findRange(a, b, str) {
    const open = findMatch(a, str);
    if (!open) return undefined;

    const stack = [];
    
    for (let i = open.index; i < str.length; i++) {
        const openMatch = findMatch(a, str, i);
        const closeMatch = findMatch(b, str, i);
        if (openMatch?.index === i) {
            stack.push(i);
            i += matchLength(a, i) - 1;
        } else if (closeMatch?.index === i) {
            if (stack.length === 0) return undefined;
            const close = i;
            if (stack.length === 1) return [stack.pop(), close];
            stack.pop();
            i += matchLength(b, i) - 1;
        }
    }
    return undefined;
}

/**
 * Calculates the matching pattern length.
 * 
 * @param {*} pattern - Match pattern, string or regex.
 * @param {number} index - Start index of match.
 * @returns {number} - Length of matched substring.
 */
function matchLength(pattern, index) {
    return typeof pattern === 'string' ? pattern.length : 0;
}

/**
 * Locates a pattern match in a string starting from an index.
 * 
 * @param {*} pattern - Pattern to match, string or regex.
 * @param {string} str - String to search through.
 * @param {number} fromIndex - Starting index for search.
 * @returns {Object|null} - Match result or null if not found.
 */
function findMatch(pattern, str, fromIndex = 0) {
    if (typeof pattern === 'string') {
        const index = str.indexOf(pattern, fromIndex);
        return index !== -1 ? { index, match: pattern } : null;
    } else {
        pattern.lastIndex = fromIndex;
        return pattern.exec(str);
    }
}

/**
 * Exposes the `findRange` functionality.
 * 
 * @param {*} a - Opening delimiter.
 * @param {*} b - Closing delimiter.
 * @param {string} str - Input string.
 * @returns {[number, number]|undefined} - Indices array if matched.
 */
balanced.range = function(a, b, str) {
    return findRange(a, b, str);
};

module.exports = balanced;
