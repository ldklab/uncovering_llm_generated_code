// is-extglob/index.js
function isExtglob(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  
  // Regular expression to match extglob patterns.
  // The pattern checks if one of the extglob operators is immediately followed by '('.
  var re = /(^|[^\\]+)(\?\(.*\)|\*\(.*\)|\+\(.*\)|@\(\.\*\)|!\(.+\))/;
  
  return re.test(str);
}

module.exports = isExtglob;
