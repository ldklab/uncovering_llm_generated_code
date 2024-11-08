const isExtglob = require('is-extglob');

const characters = { '{': '}', '(': ')', '[': ']' };
const strictPattern = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
const relaxedPattern = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;

function isGlob(string, options = {}) {
  if (typeof string !== 'string' || string === '') {
    return false;
  }

  if (isExtglob(string)) {
    return true;
  }

  const pattern = options.strict === false ? relaxedPattern : strictPattern;
  let match;

  while ((match = pattern.exec(string))) {
    if (match[2]) return true;
    let index = match.index + match[0].length;

    const openChar = match[1];
    const closeChar = openChar ? characters[openChar] : null;
    if (openChar && closeChar) {
      const closeIndex = string.indexOf(closeChar, index);
      if (closeIndex !== -1) {
        index = closeIndex + 1;
      }
    }

    string = string.slice(index);
  }
  return false;
}

module.exports = isGlob;
