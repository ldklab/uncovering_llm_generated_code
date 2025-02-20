"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const _importInjector = require("./import-injector.js");
const _isModule = require("./is-module.js");

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

exports.addDefault = function addDefault(path, importedSource, opts) {
  return new _importInjector.default(path).addDefault(importedSource, opts);
};

exports.addNamed = function addNamed(path, name, importedSource, opts) {
  return new _importInjector.default(path).addNamed(name, importedSource, opts);
};

exports.addNamespace = function addNamespace(path, importedSource, opts) {
  return new _importInjector.default(path).addNamespace(importedSource, opts);
};

exports.addSideEffect = function addSideEffect(path, importedSource, opts) {
  return new _importInjector.default(path).addSideEffect(importedSource, opts);
};

//# sourceMappingURL=index.js.map
