"use strict";

// Import and export necessary modules and functions
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "ImportInjector", {
  enumerable: true,
  get: function () {
    return _importInjector.default;
  }
});
Object.defineProperty(exports, "isModule", {
  enumerable: true,
  get: function () {
    return _isModule.default;
  }
});

// Import necessary modules
const _importInjector = require("./import-injector.js");
const _isModule = require("./is-module.js");

// Define functions to add different types of imports
function addDefault(path, importedSource, opts) {
  return new _importInjector.default(path).addDefault(importedSource, opts);
}

function addNamed(path, name, importedSource, opts) {
  return new _importInjector.default(path).addNamed(name, importedSource, opts);
}

function addNamespace(path, importedSource, opts) {
  return new _importInjector.default(path).addNamespace(importedSource, opts);
}

function addSideEffect(path, importedSource, opts) {
  return new _importInjector.default(path).addSideEffect(importedSource, opts);
}

// Export functions
exports.addDefault = addDefault;
exports.addNamed = addNamed;
exports.addNamespace = addNamespace;
exports.addSideEffect = addSideEffect;

//# sourceMappingURL=index.js.map
