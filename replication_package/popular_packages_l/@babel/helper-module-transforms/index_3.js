// mock-helper-module-transforms.js

// Function to transform ES6 export statements to CommonJS
function transformExport(ast) {
  // Transforms `export default` to `module.exports =` and `export const` to `exports.`
  return ast.replace(/export default /g, 'module.exports = ')
            .replace(/export const /g, 'exports.');
}

// Function to transform ES6 import statements to CommonJS
function transformImport(ast) {
  // Transforms `import ... from ...;` to `const ... = require(...);`
  return ast.replace(/import\s+(\w+)\s+from\s+"(.+)";/g, 'const $1 = require("$2");')
            .replace(/import\s+{\s*(.+)\s*}\s+from\s+"(.+)";/g, 'const { $1 } = require("$2");');
}

// Entry function that applies both import and export transformations
function transformModule(ast) {
  let transformedAst = transformImport(ast); // Apply import transformation
  transformedAst = transformExport(transformedAst); // Apply export transformation
  return transformedAst;
}

// Example ES6 module code to be transformed
const es6ModuleCode = `
import React from "react";
import { Component } from "react";

export default class MyComponent extends Component {}

export const myFunction = () => { return 'Hello World'; };
`;

// Performing the transformation
const transformedCode = transformModule(es6ModuleCode);

// Display the transformed code
console.log(transformedCode);

module.exports = {
  transformImport,
  transformExport,
  transformModule
};
