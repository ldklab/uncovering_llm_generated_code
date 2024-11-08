const isExtglob = require('is-extglob');

const chars = {
  '{': '}',
  '(': ')',
  '[': ']'
};

const strictRegex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
const relaxedRegex = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;

function isGlob(str, options = {}) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  if (isExtglob(str)) {
    return true;
  }

  const regex = options.strict === false ? relaxedRegex : strictRegex;
  let match;

  while ((match = regex.exec(str))) {
    if (match[2]) return true;
    let idx = match.index + match[0].length;

    const open = match[1];
    if (open) {
      const close = chars[open];
      if (close) {
        const closeIdx = str.indexOf(close, idx);
        if (closeIdx !== -1) {
          idx = closeIdx + 1;
        }
      }
    }

    str = str.slice(idx);
  }
  return false;
}

module.exports = isGlob;
