"use strict";

// Exporting the Plugin function and various modules.
Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.Plugin = Plugin;

// Export properties with specific modules attached via getter functions.
const exportsMapping = {
  File: ["_file", "default"],
  buildExternalHelpers: ["_buildExternalHelpers", "default"],
  resolvePlugin: ["_files", "resolvePlugin"],
  resolvePreset: ["_files", "resolvePreset"],
  version: ["_package", "version"],
  getEnv: ["_environment", "getEnv"],
  tokTypes: ["_parser", "tokTypes"],
  traverse: ["_traverse", "default"],
  template: ["_template", "default"],
  createConfigItem: ["_item", "createConfigItem"],
  loadPartialConfig: ["_config", "loadPartialConfig"],
  loadPartialConfigSync: ["_config", "loadPartialConfigSync"],
  loadPartialConfigAsync: ["_config", "loadPartialConfigAsync"],
  loadOptions: ["_config", "loadOptions"],
  loadOptionsSync: ["_config", "loadOptionsSync"],
  loadOptionsAsync: ["_config", "loadOptionsAsync"],
  transform: ["_transform", "transform"],
  transformSync: ["_transform", "transformSync"],
  transformAsync: ["_transform", "transformAsync"],
  transformFile: ["_transformFile", "transformFile"],
  transformFileSync: ["_transformFile", "transformFileSync"],
  transformFileAsync: ["_transformFile", "transformFileAsync"],
  transformFromAst: ["_transformAst", "transformFromAst"],
  transformFromAstSync: ["_transformAst", "transformFromAstSync"],
  transformFromAstAsync: ["_transformAst", "transformFromAstAsync"],
  parse: ["_parse", "parse"],
  parseSync: ["_parse", "parseSync"],
  parseAsync: ["_parse", "parseAsync"],
  types: ["_types", "types"]
};

for (const [exportName, [importVarName, importKey]] of Object.entries(exportsMapping)) {
  Object.defineProperty(exports, exportName, {
    enumerable: true,
    get: function () {
      return requireModule(importVarName)[importKey];
    }
  });
}

// Pre-load external modules to enhance performance.
const _file = _interopRequireDefault(require("./transformation/file/file"));
const _buildExternalHelpers = _interopRequireDefault(require("./tools/build-external-helpers"));
const _files = require("./config/files");
const _package = require("../package.json");
const _environment = require("./config/helpers/environment");
const _types = _interopRequireWildcard(require("@babel/types"));
const _parser = require("@babel/parser");
const _traverse = _interopRequireDefault(require("@babel/traverse"));
const _template = _interopRequireDefault(require("@babel/template"));
const _item = require("./config/item");
const _config = require("./config");
const _transform = require("./transform");
const _transformFile = require("./transform-file");
const _transformAst = require("./transform-ast");
const _parse = require("./parse");

// Utilities for dynamic module importing and handling
function _interopRequireWildcard(obj) {
  const cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) return cache.get(obj);
  let newObj = {};
  if (obj != null) {
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = obj[key];
      }
    }
    newObj.default = obj;
  }
  if (cache) cache.set(obj, newObj);
  return newObj;
}

// Cache for imports to prevent redundant imports
function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  const cache = new WeakMap();
  _getRequireWildcardCache = function () { return cache; };
  return cache;
}

// Handling default imports
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Module object handling
function requireModule(importName){
  switch(importName){
    case "_types":
      return _types;
    case "_traverse":
      return _traverse;
    case "_template":
      return _template;
    default:
      return {};
  }
}

// Set default extensions for transformations
const DEFAULT_EXTENSIONS = Object.freeze([".js", ".jsx", ".es6", ".es", ".mjs"]);
exports.DEFAULT_EXTENSIONS = DEFAULT_EXTENSIONS;

// Class managing options, utilizing methods from the config module
class OptionManager {
  init(opts) {
    return _config.loadOptions(opts);
  }
}

exports.OptionManager = OptionManager;

// Plugin function throwing an error for unsupported Babel versions
function Plugin(alias) {
  throw new Error(`The (${alias}) Babel 5 plugin is being run with an unsupported Babel version.`);
}
