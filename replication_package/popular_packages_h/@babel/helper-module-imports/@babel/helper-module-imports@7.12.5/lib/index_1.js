"use strict";

import ImportInjector from "./import-injector";
import isModule from "./is-module";

export { addDefault, addNamed, addNamespace, addSideEffect, ImportInjector, isModule };

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
