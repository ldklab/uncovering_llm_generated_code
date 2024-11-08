function wordWrap(str, options) {
  options = options || {};
  
  var width = options.width || 50; // Set default maximum line width to 50
  var indent = options.indent || '  '; // Set default indentation to 2 spaces
  var newline = options.newline || '\n'; // Set default newline character
  var escape = options.escape || function(s) { return s; }; // Default escape function
  var trim = options.trim || false; // Set default trimming option
  var cut = options.cut || false; // Set default option to cut without considering words

  var result = '';
  var lines = str.split(/\r?\n/); // Split the input string into lines by newline

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (trim) {
      line = line.trim(); // Trim line if trimming option is set
    }

    while (line.length > width) { // Process lines longer than specified width
      var spaceIndex = !cut ? line.lastIndexOf(' ', width) : width; // Find space or use width if cutting
      if (spaceIndex === -1) spaceIndex = width; // Reset spaceIndex if no space found

      var currentLine = line.substring(0, spaceIndex); // Select line chunk to process
      line = line.substring(spaceIndex); // Update line with rest of the text

      if (trim) {
        line = line.trim(); // Trim remaining line if trimming option is set
      }

      result += indent + escape(currentLine) + newline; // Add processed line chunk to result
    }
    
    result += indent + escape(line) + (i < lines.length - 1 ? newline : ''); // Add final part of current line
  }

  return result; // Return the resulting wrapped text
}

module.exports = wordWrap;

// Example usage
var wrap = require('./wordWrap');
console.log(wrap('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'));
