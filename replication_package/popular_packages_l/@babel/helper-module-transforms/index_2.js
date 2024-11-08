// mock-helper-module-transforms.js

// Function to transform ES6 export statements to CommonJS
function transformExport(code) {
  // Transforming export default to module.exports
  return code.replace(/export default /g, 'module.exports = ')
             // Transforming named exports to exports
             .replace(/export const /g, 'exports.');
}

// Function to transform ES6 import statements to CommonJS
function transformImport(code) {
  // Transforming default imports to require statements
  return code.replace(/import\s+(\w+)\s+from\s+"(.+)";/g, 'const $1 = require("$2");')
             // Transforming named imports to require statements
             .replace(/import\s+{\s*(.+)\s*}\s+from\s+"(.+)";/g, 'const { $1 } = require("$2");');
}

// Function that applies both import and export transformations
function transformModule(code) {
  let transformedCode = transformImport(code);
  transformedCode = transformExport(transformedCode);
  return transformedCode;
}

// Example ES6 module code for transformation
const es6ModuleCode = `
import React from "react";
import { Component } from "react";

export default class MyComponent extends Component {}

export const myFunction = () => { return 'Hello World'; };
`;

// Performing the module transformation
const transformedCode = transformModule(es6ModuleCode);

// Logging the transformed code
console.log(transformedCode);

module.exports = {
  transformImport,
  transformExport,
  transformModule
};
