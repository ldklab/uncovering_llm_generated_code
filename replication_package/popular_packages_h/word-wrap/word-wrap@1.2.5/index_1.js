function trimEnd(str) {
  let lastCharPos = str.length - 1;
  while (str[lastCharPos] === ' ' || str[lastCharPos] === '\t') {
    lastCharPos -= 1;
  }
  return str.substring(0, lastCharPos + 1);
}

function trimTabAndSpaces(str) {
  return str.split('\n').map(trimEnd).join('\n');
}

module.exports = function(str, options = {}) {
  if (str == null) return str;

  const width = options.width || 50;
  const indent = typeof options.indent === 'string' ? options.indent : '  ';
  const newline = options.newline || '\n' + indent;
  const escape = typeof options.escape === 'function' ? options.escape : str => str;
  
  const cut = options.cut === true;
  const regexPart = cut ? '.{1,' + width + '}' : '.{1,' + width + '}(\\s|$)|[^\\s]+?(\\s|$)';
  const regex = new RegExp(regexPart, 'g');
  
  const lines = str.match(regex) || [];
  let result = lines.map(line => escape(line.trimEnd())).join(newline);

  result = indent + result;
  
  return options.trim ? trimTabAndSpaces(result) : result;
};
