const path = require('path');
const acorn = require('acorn');
const estreeWalker = require('estree-walker');
const picomatch = require('picomatch');

// Adds an extension to a filename if it lacks one.
function addExtension(filename, ext = '.js') {
  return path.extname(filename) ? filename : filename + ext;
}

// Attaches scopes to nodes within an AST, returning a mock scope object.
function attachScopes(ast, propertyName = 'scope') {
  return {}; // Simplified for demonstration
}

// Generates a filter function from given include/exclude patterns.
function createFilter(include, exclude, { resolve } = {}) {
  const includeMatcher = include ? picomatch(include) : () => true;
  const excludeMatcher = exclude ? picomatch(exclude) : () => false;
  
  return id => {
    if (typeof id !== 'string') return false;
    if (resolve) id = path.resolve(resolve, id);
    return includeMatcher(id) && !excludeMatcher(id);
  };
}

// Converts an object into an ES Module export format.
function dataToEsm(data, options = {}) {
  const entries = Object.entries(data)
    .map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`)
    .join(options.indent || '\n');
  
  return `${entries}\nexport default { ${Object.keys(data).join(', ')} };`;
}

// Placeholder function for extracting variable names from node parameters.
function extractAssignedNames(param) {
  return []; // Simplified for demonstration
}

// Converts a string into a valid JS identifier by replacing invalid characters.
function makeLegalIdentifier(str) {
  return str.replace(/[^$_a-zA-Z0-9]/g, '_');
}

// Normalizes file paths to use forward slashes.
function normalizePath(filename) {
  return filename.split(path.sep).join('/');
}

module.exports = {
  addExtension,
  attachScopes,
  createFilter,
  dataToEsm,
  extractAssignedNames,
  makeLegalIdentifier,
  normalizePath
};

// Example usage (commented out for module)
 /*
import { addExtension, attachScopes, createFilter, dataToEsm,
  extractAssignedNames, makeLegalIdentifier, normalizePath } from '@rollup/pluginutils';

let id = addExtension("module");
console.log(id); // module.js

const esm = dataToEsm({ foo: 'bar' }, { indent: '  ' });
console.log(esm);

let legalId = makeLegalIdentifier("foo-bar");
console.log(legalId); // foo_bar

let pathNorm = normalizePath("foo\\bar");
console.log(pathNorm); // foo/bar

const filter = createFilter(['**/*.js'], ['node_modules/**']);
console.log(filter('src/index.js')); // true
console.log(filter('node_modules/pkg/index.js')); // false
*/
