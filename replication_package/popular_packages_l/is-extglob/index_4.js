// is-extglob/index.js

function isExtglob(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  // Regular expression to match extglob patterns:
  // '?()', '*()', '+()', '@()', '!()' immediately following any character except '\'.
  const extglobPattern = /(^|[^\\])(\?\(.*\)|\*\(.*\)|\+\(.*\)|@\(\.\*\)|!\(.+\))/;

  return extglobPattern.test(input);
}

module.exports = isExtglob;
