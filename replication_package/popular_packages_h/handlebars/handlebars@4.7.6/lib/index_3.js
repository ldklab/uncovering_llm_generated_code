const fs = require('fs');
const handlebars = require('../dist/cjs/handlebars').default;
const printer = require('../dist/cjs/handlebars/compiler/printer');

// Extend handlebars with printing capabilities
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

module.exports = handlebars;

// Handler function to compile handlebars files
function extension(module, filename) {
  const templateString = fs.readFileSync(filename, 'utf8');
  module.exports = handlebars.compile(templateString);
}

// Register extensions if in a Node.js environment
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = extension;
  require.extensions['.hbs'] = extension;
}
