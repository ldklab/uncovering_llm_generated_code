// USAGE:
// const handlebars = require('handlebars');

const fs = require('fs');
const handlebarsModule = require('../dist/cjs/handlebars');
const printer = require('../dist/cjs/handlebars/compiler/printer');

const handlebars = handlebarsModule['default'];
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

module.exports = handlebars;

// Publish a Node.js require() handler for .handlebars and .hbs files
function extension(module, filename) {
  const templateString = fs.readFileSync(filename, 'utf8');
  module.exports = handlebars.compile(templateString);
}

if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = extension;
  require.extensions['.hbs'] = extension;
}
