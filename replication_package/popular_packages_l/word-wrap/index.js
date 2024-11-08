function wordWrap(str, options) {
  options = options || {};
  
  var width = options.width || 50;
  var indent = options.indent || '  ';
  var newline = options.newline || '\n';
  var escape = options.escape || function(s) { return s; };
  var trim = options.trim || false;
  var cut = options.cut || false;

  var result = '';
  var lines = str.split(/\r?\n/);

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (trim) {
      line = line.trim();
    }

    while (line.length > width) {
      var spaceIndex = !cut ? line.lastIndexOf(' ', width) : width;
      if (spaceIndex === -1) spaceIndex = width;

      var currentLine = line.substring(0, spaceIndex);
      line = line.substring(spaceIndex);

      if (trim) {
        line = line.trim();
      }

      result += indent + escape(currentLine) + newline;
    }
    
    result += indent + escape(line) + (i < lines.length - 1 ? newline : '');
  }

  return result;
}

module.exports = wordWrap;

// Example usage
var wrap = require('./wordWrap');
console.log(wrap('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'));
