// balanced-match.js

/**
 * Main function to find balanced matches between a pair of delimiters in a string.
 * 
 * @param {*} a - The opening delimiter, can be a string or regex.
 * @param {*} b - The closing delimiter, can be a string or regex.
 * @param {string} str - The input string where matching is performed.
 * @returns {Object|undefined} - Returns an object containing indices and substrings if a match is found.
 */
function balanced(a, b, str) {
  const range = getRange(a, b, str);
  if (!range) return undefined;

  return {
    start: range[0],
    end: range[1],
    pre: str.slice(0, range[0]),
    body: str.slice(range[0] + getMatchLength(a), range[1]),
    post: str.slice(range[1] + getMatchLength(b))
  };
}

/**
 * Helper function to find the range of the first balanced match in a string.
 * 
 * @param {*} a - The opening delimiter, can be a string or regex.
 * @param {*} b - The closing delimiter, can be a string or regex.
 * @param {string} str - The input string to search.
 * @returns {Array|undefined} - Returns an array with start and end indices of a match.
 */
function getRange(a, b, str) {
  const openMatch = findPattern(a, str);
  if (!openMatch) return undefined;

  let stack = [];

  for (let i = openMatch.index; i < str.length; i++) {
    const openIndex = findPattern(a, str, i)?.index;
    if (openIndex === i) {
      stack.push(i);
      i += getMatchLength(a) - 1;
    } else {
      const closeIndex = findPattern(b, str, i)?.index;
      if (closeIndex === i) {
        if (stack.length === 0) return undefined;
        const open = stack.pop();
        if (stack.length === 0) return [open, i];
        i += getMatchLength(b) - 1;
      }
    }
  }
  return undefined;
}

/**
 * Helper function to measure the length of a match.
 * 
 * @param {*} pattern - The pattern matched, can be a string or regex.
 * @returns {number} - Length of the matched substring.
 */
function getMatchLength(pattern) {
  return (typeof pattern === 'string') ? pattern.length : 0; 
}

/**
 * Helper function to find a match for a pattern in a string from a given index.
 * 
 * @param {*} pattern - The pattern to match, can be a string or regex.
 * @param {string} str - The string to search in.
 * @param {number} fromIndex - The index to start searching from.
 * @returns {Object|null} - Match result from String.match() or RegExp.exec().
 */
function findPattern(pattern, str, fromIndex = 0) {
  if (typeof pattern === 'string') {
    const index = str.indexOf(pattern, fromIndex);
    return index !== -1 ? { index, match: pattern } : null;
  } else {
    pattern.lastIndex = fromIndex;
    return pattern.exec(str);
  }
}

/**
 * Function to get the index range of the first balanced match in a string.
 * 
 * @param {*} a - The opening delimiter, can be a string or regex.
 * @param {*} b - The closing delimiter, can be a string or regex.
 * @param {string} str - The input string to search within.
 * @returns {Array|undefined} - Returns an array with start and end indices of a match.
 */
balanced.range = function(a, b, str) {
  return getRange(a, b, str);
};

module.exports = balanced;
