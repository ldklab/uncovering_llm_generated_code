function trimEnd(str) {
  let lastCharPos = str.length - 1;
  while (lastCharPos >= 0 && (str[lastCharPos] === ' ' || str[lastCharPos] === '\t')) {
    lastCharPos--;
  }
  return str.substring(0, lastCharPos + 1);
}

function trimTabAndSpaces(str) {
  return str.split('\n').map(trimEnd).join('\n');
}

module.exports = function wrapText(str, options = {}) {
  if (str == null) return str;

  const width = options.width || 50;
  const indent = typeof options.indent === 'string' ? options.indent : '  ';
  const newline = options.newline || '\n' + indent;
  const escape = typeof options.escape === 'function' ? options.escape : (s) => s;

  const regexPattern = options.cut === true ? '.{1,' + width + '}' : '.{1,' + width + '}([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  const regex = new RegExp(regexPattern, 'g');
  const lines = str.match(regex) || [];

  let result = indent + lines.map(line => escape(line.trimEnd())).join(newline);

  return options.trim === true ? trimTabAndSpaces(result) : result;
};
