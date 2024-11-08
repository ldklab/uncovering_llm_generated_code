function wordWrap(str, options = {}) {
  const {
    width = 50,
    indent = '  ',
    newline = '\n',
    escape = s => s,
    trim = false,
    cut = false,
  } = options;

  let result = '';
  const lines = str.split(/\r?\n/);

  lines.forEach((originalLine, index) => {
    let line = trim ? originalLine.trim() : originalLine;

    while (line.length > width) {
      let spaceIndex = !cut ? line.lastIndexOf(' ', width) : width;
      if (spaceIndex === -1) spaceIndex = width;

      const currentLine = line.slice(0, spaceIndex);
      line = line.slice(spaceIndex);

      if (trim) line = line.trim();

      result += indent + escape(currentLine) + newline;
    }

    result += indent + escape(line) + (index < lines.length - 1 ? newline : '');
  });

  return result;
}

module.exports = wordWrap;

// Example usage
const wrap = require('./wordWrap');
console.log(wrap('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'));
