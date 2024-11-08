const path = require('path');
const picomatch = require('picomatch');

// Adds an extension to a filename if it doesn't have one
function addExtension(filename, ext = '.js') {
  return path.extname(filename) ? filename : filename + ext;
}

// Creates a filter to include/exclude paths based on patterns
function createFilter(include, exclude, { resolve } = {}) {
  const includeMatcher = include ? picomatch(include) : () => true;
  const excludeMatcher = exclude ? picomatch(exclude) : () => false;

  return id => {
    if (typeof id !== 'string') return false;
    if (resolve) id = path.resolve(resolve, id);
    return includeMatcher(id) && !excludeMatcher(id);
  };
}

// Converts an object into an ES Module format string
function dataToEsm(data, options = {}) {
  const entries = Object.entries(data)
    .map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`)
    .join(options.indent || '\n');

  return `${entries}\nexport default { ${Object.keys(data).join(', ')} };`;
}

// Converts a string into a valid JavaScript identifier
function makeLegalIdentifier(str) {
  return str.replace(/[^$_a-zA-Z0-9]/g, '_');
}

// Normalizes file path separators to use forward slashes
function normalizePath(filename) {
  return filename.split(path.sep).join('/');
}

module.exports = {
  addExtension,
  createFilter,
  dataToEsm,
  makeLegalIdentifier,
  normalizePath
};

// Example usage
/*
import { addExtension, createFilter, dataToEsm, 
  makeLegalIdentifier, normalizePath } from '@rollup/pluginutils';

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
