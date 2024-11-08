"use strict";

// Exporting functions and objects
exports.addDefault = addDefault;
exports.addNamed = addNamed;
exports.addNamespace = addNamespace;
exports.addSideEffect = addSideEffect;

// Re-exporting ImportInjector and isModule
exports.ImportInjector = _importInjector.default;
exports.isModule = _isModule.default;

// Importing dependencies
var _importInjector = require("./import-injector");
var _isModule = require("./is-module");

// Utility function for interop default
function _interopRequireDefault(obj) { 
  return obj && obj.__esModule ? obj : { default: obj }; 
}

// Defining functions to add different types of imports
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
