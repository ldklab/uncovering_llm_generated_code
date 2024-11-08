/*!
 * word-wrap <https://github.com/jonschlinkert/word-wrap>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

module.exports = function wrapText(str, options = {}) {
  if (str == null) {
    return str;
  }

  const {
    width = 50,
    indent = '  ',
    newline = `\n${indent}`,
    escape = (s) => s,
    trim = false,
    cut = false
  } = options;

  // Construct regex for wrapping
  let regexString = `.{1,${width}}`;
  if (!cut) {
    regexString += '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  }

  const lineRegex = new RegExp(regexString, 'g');
  const lines = str.match(lineRegex) || [];

  // Process lines with specified transformations
  let result = indent + lines.map((line) => {
    if (line.endsWith('\n')) {
      line = line.slice(0, -1);
    }
    return escape(line);
  }).join(newline);

  // Optionally trim trailing whitespace
  if (trim) {
    result = result.replace(/[ \t]*$/gm, '');
  }
  
  return result;
};
