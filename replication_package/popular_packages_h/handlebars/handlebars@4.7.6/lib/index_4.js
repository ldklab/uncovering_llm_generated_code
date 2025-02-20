// This Node.js module is related to using Handlebars, a popular templating engine for dynamic content generation.
// Initially disables `no-var` eslint rules for older style variable declarations.

// Import the default module from a custom path in the Handlebars library
var handlebars = require('../dist/cjs/handlebars')['default'];

// Import specific functions from the Handlebars compiler's printer tool
var printer = require('../dist/cjs/handlebars/compiler/printer');

// Extend the handlebars object with print functionality
handlebars.PrintVisitor = printer.PrintVisitor; 
handlebars.print = printer.print;

// Export the extended handlebars object for use in other modules
module.exports = handlebars;

// Function to handle .handlebars and .hbs file extension processing
function extension(module, filename) {
  // Read the content from the file
  var fs = require('fs');
  var templateString = fs.readFileSync(filename, 'utf8');
  // Compile the template content and assign it to module.exports
  module.exports = handlebars.compile(templateString);
}

// If Node.js require extension feature is available, set up custom handlers for .handlebars and .hbs file extensions
/* istanbul ignore else */
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = extension;
  require.extensions['.hbs'] = extension;
}
