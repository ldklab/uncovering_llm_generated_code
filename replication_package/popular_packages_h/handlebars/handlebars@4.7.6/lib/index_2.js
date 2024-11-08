// Import the default export from the 'handlebars' package located in the parent directory's dist/cjs folder
var handlebars = require('../dist/cjs/handlebars')['default'];

// Import the 'printer' module from the compiler directory within handlebars and assign functions to handlebars object
var printer = require('../dist/cjs/handlebars/compiler/printer');
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

// Export the configured 'handlebars' object to be used elsewhere
module.exports = handlebars;

// Function to handle .handlebars and .hbs file extensions
function extension(module, filename) {
  var fs = require('fs');
  // Read the template file's content as a string
  var templateString = fs.readFileSync(filename, 'utf8');
  // Compile the template content into a JavaScript function and export it from the module
  module.exports = handlebars.compile(templateString);
}

// If the environment supports require.extensions, register the handler for .handlebars and .hbs extensions
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = extension;
  require.extensions['.hbs'] = extension;
}
