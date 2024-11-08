/**
 * This function takes a string and options to return a word-wrapped version of the string. 
 * It breaks the input string into multiple lines based on the specified width and adds an indent, 
 * newline character, and can trim or cut words based on the provided options.
 * 
 * @param {string} str - The string to be wrapped.
 * @param {Object} options - An object containing optional configuration for wrapping.
 * @returns {string} - The word-wrapped string.
 */
function wordWrap(str, options = {}) {
  // Default options handling
  const {
    width = 50,
    indent = '  ',
    newline = '\n',
    escape = s => s,
    trim = false,
    cut = false
  } = options;

  let result = '';
  const lines = str.split(/\r?\n/);

  for (let line of lines) {
    if (trim) {
      line = line.trim();
    }

    while (line.length > width) {
      // Determine the point to break the line according to 'cut' option
      const spaceIndex = !cut ? line.lastIndexOf(' ', width) : width;
      const breakPoint = (spaceIndex === -1) ? width : spaceIndex;

      const currentLine = line.substring(0, breakPoint);
      line = line.substring(breakPoint);

      if (trim) {
        line = line.trim();
      }

      result += `${indent}${escape(currentLine)}${newline}`;
    }

    result += `${indent}${escape(line)}`;
    if (line !== lines[lines.length - 1]) {
      result += newline;
    }
  }

  return result;
}

module.exports = wordWrap;

// Example usage
const wrap = require('./wordWrap');
console.log(wrap('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'));
