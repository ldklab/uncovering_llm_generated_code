/*!
 * word-wrap <https://github.com/jonschlinkert/word-wrap>
 * 
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

module.exports = function(str, options = {}) {
  if (str == null) return str;

  const width = options.width || 50;
  const indent = (typeof options.indent === 'string') ? options.indent : '  ';
  const newline = options.newline || '\n' + indent;
  const escape = (typeof options.escape === 'function') ? options.escape : identity;
  
  let regexString = `.{1,${width}}`;
  if (!options.cut) {
    regexString += '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  }
  
  const re = new RegExp(regexString, 'g');
  const lines = str.match(re) || [];
  let result = lines.map(line => {
    if (line.endsWith('\n')) {
      line = line.slice(0, -1);
    }
    return escape(line);
  }).join(newline);

  if (options.trim) {
    result = result.replace(/[ \t]*$/gm, '');
  }

  return indent + result;
};

function identity(str) {
  return str;
}
