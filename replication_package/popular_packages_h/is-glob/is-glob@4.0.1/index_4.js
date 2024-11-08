const isExtglob = require('is-extglob');
const chars = { '{': '}', '(': ')', '[': ']'};

const strictGlobPattern = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
const relaxedGlobPattern = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;

/**
 * Determines if a given string is a glob pattern.
 *
 * @param {string} str - The string to check.
 * @param {object} [options] - Optional settings.
 * @param {boolean} [options.strict=true] - Use strict glob pattern matching.
 * @returns {boolean} - True if the string is a glob pattern, false otherwise.
 */
function isGlob(str, options = {}) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  if (isExtglob(str)) {
    return true;
  }

  const useStrict = options.strict !== false;
  let regex = useStrict ? strictGlobPattern : relaxedGlobPattern;
  let match;
  
  while ((match = regex.exec(str))) {
    if (match[2]) return true;
    
    let idx = match.index + match[0].length;
    const open = match[1];
    const close = open ? chars[open] : null;

    if (open && close) {
      const closingIdx = str.indexOf(close, idx);
      if (closingIdx > -1) {
        idx = closingIdx + 1;
      }
    }
    str = str.slice(idx);
  }
  
  return false;
}

module.exports = isGlob;
