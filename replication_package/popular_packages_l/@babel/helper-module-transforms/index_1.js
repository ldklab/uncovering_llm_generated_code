// This module provides functions to transform ES6 module syntax into CommonJS.
// Specifically, it converts 'import' and 'export' statements.

function transformExport(ast) {
  // Converts ES6 export statements to CommonJS.
  // Converts `export default` to `module.exports`
  // Converts `export const`/`export let`/`export var` to `exports.`

  return ast
    .replace(/export default /g, 'module.exports = ')
    .replace(/export const /g, 'exports.')
    .replace(/export let /g, 'exports.')
    .replace(/export var /g, 'exports.');
}

function transformImport(ast) {
  // Converts ES6 import statements to CommonJS.
  // Converts `import x from "module"` to `const x = require("module")`
  // Converts `import { x } from "module"` to `const { x } = require("module")`
  // Converts `import * as x from "module"` to `const x = require("module")`

  return ast
    .replace(/import\s+(\w+)\s+from\s+"(.+)";/g, 'const $1 = require("$2");')
    .replace(/import\s+{\s*(.+)\s*}\s+from\s+"(.+)";/g, 'const { $1 } = require("$2");')
    .replace(/import\s+\*\s+as\s+(\w+)\s+from\s+"(.+)";/g, 'const $1 = require("$2");');
}

function transformModule(ast) {
  // This function applies both import and export transformations to the code.
  let transformedAst = transformImport(ast);
  transformedAst = transformExport(transformedAst);
  return transformedAst;
}

// Simulating an ES6 module code snippet for transformation
const es6ModuleCode = `
import React from "react";
import { Component } from "react";

export default class MyComponent extends Component {}

export const myFunction = () => { return 'Hello World'; };
`;

// Transform the ES6 code to CommonJS
const transformedCode = transformModule(es6ModuleCode);

// Log the transformed code
console.log(transformedCode);

// Export the transformation functions for external use
module.exports = {
  transformImport,
  transformExport,
  transformModule
};
