module.exports = function wrapText(input, options = {}) {
  if (input == null) return input;

  const width = options.width || 50;
  const indent = (typeof options.indent === 'string') ? options.indent : '  ';
  const newline = options.newline || '\n' + indent;
  const escape = (typeof options.escape === 'function') ? options.escape : text => text;

  const patternBase = '.{1,' + width + '}';
  const pattern = options.cut === true ? patternBase : patternBase + '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  const regex = new RegExp(pattern, 'g');

  const lines = input.match(regex) || [];
  let formattedText = indent + lines.map(line => {
    if (line.endsWith('\n')) line = line.slice(0, -1);
    return escape(line);
  }).join(newline);

  if (options.trim === true) {
    formattedText = formattedText.replace(/[ \t]*$/gm, '');
  }

  return formattedText;
};
