"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Exporting the 'ImportInjector' and 'isModule' properties as part of the module's public API.
Object.defineProperty(exports, "ImportInjector", {
  enumerable: true,
  get: function () {
    return ImportInjector;
  }
});
Object.defineProperty(exports, "isModule", {
  enumerable: true,
  get: function () {
    return isModule;
  }
});

// Exporting utility functions for manipulating JavaScript imports.
exports.addDefault = addDefault;
exports.addNamed = addNamed;
exports.addNamespace = addNamespace;
exports.addSideEffect = addSideEffect;

// Importing internal modules required for this module's functionality.
const ImportInjector = require("./import-injector.js").default;
const isModule = require("./is-module.js").default;

// Function to add a default import to a JavaScript file.
function addDefault(path, importedSource, opts) {
  return new ImportInjector(path).addDefault(importedSource, opts);
}

// Function to add a named import to a JavaScript file.
function addNamed(path, name, importedSource, opts) {
  return new ImportInjector(path).addNamed(name, importedSource, opts);
}

// Function to add a namespace import to a JavaScript file.
function addNamespace(path, importedSource, opts) {
  return new ImportInjector(path).addNamespace(importedSource, opts);
}

// Function to add a side effect-only import to a JavaScript file.
function addSideEffect(path, importedSource, opts) {
  return new ImportInjector(path).addSideEffect(importedSource, opts);
}

//# sourceMappingURL=index.js.map
