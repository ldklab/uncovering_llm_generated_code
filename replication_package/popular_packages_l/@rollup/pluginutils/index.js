const path = require('path');
const acorn = require('acorn');
const estreeWalker = require('estree-walker');
const picomatch = require('picomatch');

// Adds an extension to a module ID if one does not exist.
function addExtension(filename, ext = '.js') {
  if (!path.extname(filename)) {
    return filename + ext;
  }
  return filename;
}

// Attaches scopes to nodes in an AST.
function attachScopes(ast, propertyName = 'scope') {
  // Implementation details omitted for brevity
  return {}; // Returns a mock scope object
}

// Creates a filter based on include/exclude patterns.
function createFilter(include, exclude, { resolve } = {}) {
  const includeMatcher = include ? picomatch(include) : () => true;
  const excludeMatcher = exclude ? picomatch(exclude) : () => false;
  
  return id => {
    if (typeof id !== 'string') return false;
    if (resolve) id = path.resolve(resolve, id);
    return includeMatcher(id) && !excludeMatcher(id);
  };
}

// Transforms objects into ES Module format.
function dataToEsm(data, options = {}) {
  // Simplified implementation for demonstration
  const entries = Object.entries(data)
    .map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`)
    .join(options.indent || '\n');

  return `${entries}\nexport default { ${Object.keys(data).join(', ')} };`;
}

// Extracts the names of all assignment targets.
function extractAssignedNames(param) {
  // Simplified implementation for demonstration
  // Should parse the node to yield variable names
  return []; // Assume an empty array for demonstration
}

// Converts a string to a legal JS identifier.
function makeLegalIdentifier(str) {
  return str.replace(/[^$_a-zA-Z0-9]/g, '_');
}

// Converts path separators to forward slashes.
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

// Example usage
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
