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
  let range = findRange(a, b, str);
  if (!range) return undefined;
  
  return {
    start: range[0],
    end: range[1],
    pre: str.slice(0, range[0]),
    body: str.slice(range[0] + matchLength(a, range[0]), range[1]),
    post: str.slice(range[1] + matchLength(b, range[1]))
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
function findRange(a, b, str) {
  let open = findMatch(a, str), close;
  if (!open) return undefined;

  let stack = [];
  
  for (let i = open.index; i < str.length; i++) {
    if (findMatch(a, str, i)?.index === i) {
      stack.push(i);
      i += matchLength(a, i) - 1;
    } else if (findMatch(b, str, i)?.index === i) {
      if (stack.length === 0) return undefined;
      close = i;
      if (stack.length === 1) return [stack.pop(), close];
      stack.pop();
      i += matchLength(b, i) - 1;
    }
  }
  return undefined;
}

/**
 * Helper function to measure the length of a match.
 * 
 * @param {*} pattern - The pattern matched, can be a string or regex.
 * @param {number} index - The index where match starts.
 * @returns {number} - Length of the matched substring.
 */
function matchLength(pattern, index) {
  return (typeof pattern === 'string') ? pattern.length : 0; // Regex length cannot be directly measured
}

/**
 * Helper function to find a match for a pattern in a string from a given index.
 * 
 * @param {*} pattern - The pattern to match, can be a string or regex.
 * @param {string} str - The string to search in.
 * @param {number} fromIndex - The index to start searching from.
 * @returns {Object|null} - Match result from String.match() or RegExp.exec().
 */
function findMatch(pattern, str, fromIndex = 0) {
  if (typeof pattern === 'string') {
    let index = str.indexOf(pattern, fromIndex);
    return index === -1 ? null : { index: index, match: pattern };
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
  return findRange(a, b, str);
};

module.exports = balanced;
