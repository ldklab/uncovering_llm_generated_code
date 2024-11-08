"use strict";

// Exporting functions
exports.addDefault = addDefault;
exports.addNamed = addNamed;
exports.addNamespace = addNamespace;
exports.addSideEffect = addSideEffect;

// Importing dependencies
const ImportInjector = require('./import-injector').default;
const isModule = require('./is-module').default;

// Exporting dependencies
exports.ImportInjector = ImportInjector;
exports.isModule = isModule;

// Functions implementations
function addDefault(path, importedSource, opts) {
  return new ImportInjector(path).addDefault(importedSource, opts);
}

function addNamed(path, name, importedSource, opts) {
  return new ImportInjector(path).addNamed(name, importedSource, opts);
}

function addNamespace(path, importedSource, opts) {
  return new ImportInjector(path).addNamespace(importedSource, opts);
}

function addSideEffect(path, importedSource, opts) {
  return new ImportInjector(path).addSideEffect(importedSource, opts);
}
