// This Node.js module exports a configured instance of Handlebars with additional functionalities.
// Handlebars is a templating engine used for generating HTML or other text formats.

// Import the default Handlebars instance from the specified path.
var handlebars = require('../dist/cjs/handlebars')['default'];

// Import the printer functionality used for debugging templates from Handlebars.
var printer = require('../dist/cjs/handlebars/compiler/printer');

// Add the PrintVisitor and print methods to the Handlebars instance.
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

// Export the configured Handlebars instance for use in other parts of the application.
module.exports = handlebars;

// Define a function to handle the loading and compilation of .handlebars and .hbs files.
function extension(module, filename) {
  var fs = require('fs'); // Import the file system module to read template files.
  var templateString = fs.readFileSync(filename, 'utf8'); // Synchronically read the file content as a UTF-8 string.
  module.exports = handlebars.compile(templateString); // Compile the template string and export it as the module's export.
}

// Define require() extensions for .handlebars and .hbs files only if require.extensions is available.
if (typeof require !== 'undefined' && require.extensions) {
  // Register the extension function to handle .handlebars files.
  require.extensions['.handlebars'] = extension;
  // Register the extension function to handle .hbs files.
  require.extensions['.hbs'] = extension;
}
