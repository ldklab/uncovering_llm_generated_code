/*!
 * word-wrap <https://github.com/jonschlinkert/word-wrap>
 *
 * Copyright (c) 2014-2023, Jon Schlinkert.
 * Released under the MIT License.
 */

function trimEnd(str) {
  let lastCharIndex = str.length - 1;
  while (lastCharIndex >= 0 && (str[lastCharIndex] === ' ' || str[lastCharIndex] === '\t')) {
    lastCharIndex--;
  }
  return str.substring(0, lastCharIndex + 1);
}

function trimLines(str) {
  return str.split('\n').map(trimEnd).join('\n');
}

module.exports = function wrapText(str, options = {}) {
  if (str == null) return str;

  const width = options.width || 50;
  const indent = typeof options.indent === 'string' ? options.indent : '  ';
  const newline = options.newline || '\n' + indent;
  const escape = typeof options.escape === 'function' ? options.escape : (text) => text;

  let regexPattern = '.{1,' + width + '}';
  if (!options.cut) {
    regexPattern += '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  }

  const regex = new RegExp(regexPattern, 'g');
  const lines = str.match(regex) || [];
  let wrappedText = indent + lines.map((line) => escape(line.trimEnd())).join(newline);

  if (options.trim) {
    wrappedText = trimLines(wrappedText);
  }
  
  return wrappedText;
};
