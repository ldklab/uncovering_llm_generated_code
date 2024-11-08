jsx
// Import necessary modules
const handlebars = require('../dist/cjs/handlebars')['default'];
const printer = require('../dist/cjs/handlebars/compiler/printer');

// Extend handlebars with additional printing functionality
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

// Export the configured handlebars module
module.exports = handlebars;

// Function to compile and export Handlebars templates from .handlebars or .hbs files
function extension(module, filename) {
  const fs = require('fs');
  const templateString = fs.readFileSync(filename, 'utf8');
  module.exports = handlebars.compile(templateString);
}

// Register the extension handler for .handlebars and .hbs if require.extensions is supported
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = extension;
  require.extensions['.hbs'] = extension;
}
