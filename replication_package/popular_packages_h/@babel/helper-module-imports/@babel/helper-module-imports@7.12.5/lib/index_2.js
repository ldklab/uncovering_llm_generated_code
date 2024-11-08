"use strict";

import _importInjector from "./import-injector";
import _isModule from "./is-module";

export function addDefault(path, importedSource, opts) {
  return new _importInjector(path).addDefault(importedSource, opts);
}

export function addNamed(path, name, importedSource, opts) {
  return new _importInjector(path).addNamed(name, importedSource, opts);
}

export function addNamespace(path, importedSource, opts) {
  return new _importInjector(path).addNamespace(importedSource, opts);
}

export function addSideEffect(path, importedSource, opts) {
  return new _importInjector(path).addSideEffect(importedSource, opts);
}

export { _importInjector as ImportInjector, _isModule as isModule };
