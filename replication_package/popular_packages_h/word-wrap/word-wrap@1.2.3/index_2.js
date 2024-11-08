/*!
 * word-wrap <https://github.com/jonschlinkert/word-wrap>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

module.exports = function wrapText(string, options = {}) {
  if (!string) {
    return string;
  }

  const width = options.width || 50;
  const indent = typeof options.indent === 'string' ? options.indent : '  ';
  const newline = options.newline || '\n' + indent;
  const escape = typeof options.escape === 'function' ? options.escape : str => str;

  let regexPattern = `.{1,${width}}`;
  if (options.cut !== true) {
    regexPattern += '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  }

  const regex = new RegExp(regexPattern, 'g');
  const lines = string.match(regex) || [];
  
  let result = indent + lines.map(line => {
    if (line.endsWith('\n')) {
      line = line.slice(0, -1);
    }
    return escape(line);
  }).join(newline);

  if (options.trim) {
    result = result.replace(/[ \t]*$/gm, '');
  }

  return result;
};
