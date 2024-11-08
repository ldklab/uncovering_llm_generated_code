// USAGE:
// const handlebars = require('handlebars');
/* eslint-env node */

const handlebars = require('../dist/cjs/handlebars').default;
const { PrintVisitor, print } = require('../dist/cjs/handlebars/compiler/printer');

handlebars.PrintVisitor = PrintVisitor;
handlebars.print = print;

module.exports = handlebars;

// Publish a Node.js require() handler for .handlebars and .hbs files
function handleExtension(module, filename) {
  const fs = require('fs');
  const templateString = fs.readFileSync(filename, 'utf8');
  module.exports = handlebars.compile(templateString);
}

if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = handleExtension;
  require.extensions['.hbs'] = handleExtension;
}
