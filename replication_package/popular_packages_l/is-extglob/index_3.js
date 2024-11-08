// is-extglob-revised.js
function isExtglob(inputString) {
  if (typeof inputString !== 'string') {
    throw new TypeError('Expected a string');
  }

  // Regular expression to detect extglob patterns.
  const extglobPattern = /(^|[^\\])(\?\(.*?\)|\*\(.*?\)|\+\(.*?\)|@\(\.\*?\)|!\(.+?\))/;

  return extglobPattern.test(inputString);
}

module.exports = isExtglob;
