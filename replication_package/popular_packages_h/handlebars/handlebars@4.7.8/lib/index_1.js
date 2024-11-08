// Import Handlebars core
const handlebars = require('../dist/cjs/handlebars').default;

// Import printer utilities and extend Handlebars with custom printing functionality
const printer = require('../dist/cjs/handlebars/compiler/printer');
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

// Export the extended Handlebars module
module.exports = handlebars;

// Function to handle custom file extensions (.handlebars and .hbs)
function extension(module, filename) {
  const fs = require('fs');
  const templateString = fs.readFileSync(filename, 'utf8');
  module.exports = handlebars.compile(templateString);
}

// Register .handlebars and .hbs extensions with the custom handler
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = extension;
  require.extensions['.hbs'] = extension;
}
