// is-extglob/index.js
function isExtglob(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  
  // Regular expression to match extglob patterns.
  const re = /(^|[^\\]+)(\?\(.*?\)|\*\(.*?\)|\+\(.*?\)|@\(\.\*?\)|!\(.+?\))/;
  
  return re.test(str);
}

module.exports = isExtglob;
