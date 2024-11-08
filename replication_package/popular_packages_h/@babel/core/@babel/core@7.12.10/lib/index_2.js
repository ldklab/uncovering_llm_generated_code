"use strict";

// Define exports namespace module
Object.defineProperty(exports, "__esModule", { value: true });

// Export the Plugin function
exports.Plugin = Plugin;

// Export various modules and functions from related files
exports.File = _file.default;
exports.buildExternalHelpers = _buildExternalHelpers.default;
exports.resolvePlugin = _files.resolvePlugin;
exports.resolvePreset = _files.resolvePreset;
exports.version = _package.version;
exports.getEnv = _environment.getEnv;
exports.tokTypes = _parser().tokTypes;
exports.traverse = _traverse().default;
exports.template = _template().default;
exports.createConfigItem = _item.createConfigItem;
exports.loadPartialConfig = _config.loadPartialConfig;
exports.loadPartialConfigSync = _config.loadPartialConfigSync;
exports.loadPartialConfigAsync = _config.loadPartialConfigAsync;
exports.loadOptions = _config.loadOptions;
exports.loadOptionsSync = _config.loadOptionsSync;
exports.loadOptionsAsync = _config.loadOptionsAsync;
exports.transform = _transform.transform;
exports.transformSync = _transform.transformSync;
exports.transformAsync = _transform.transformAsync;
exports.transformFile = _transformFile.transformFile;
exports.transformFileSync = _transformFile.transformFileSync;
exports.transformFileAsync = _transformFile.transformFileAsync;
exports.transformFromAst = _transformAst.transformFromAst;
exports.transformFromAstSync = _transformAst.transformFromAstSync;
exports.transformFromAstAsync = _transformAst.transformFromAstAsync;
exports.parse = _parse.parse;
exports.parseSync = _parse.parseSync;
exports.parseAsync = _parse.parseAsync;

// Export constants
exports.types = exports.OptionManager = exports.DEFAULT_EXTENSIONS = void 0;

// Import relevant modules and libraries
const _file = _interopRequireDefault(require("./transformation/file/file"));
const _buildExternalHelpers = _interopRequireDefault(require("./tools/build-external-helpers"));
const _files = require("./config/files");
const _package = require("../package.json");
const _environment = require("./config/helpers/environment");

// Utilize Babel's types with lazy-loaded import
function _types() {
  const data = _interopRequireWildcard(require("@babel/types"));
  _types = () => data;
  return data;
}

exports.types = _types();

// Use Babel's parser module
function _parser() {
  const data = require("@babel/parser");
  _parser = () => data;
  return data;
}

// Use Babel's traverse module
function _traverse() {
  const data = _interopRequireDefault(require("@babel/traverse"));
  _traverse = () => data;
  return data;
}

// Use Babel's template module
function _template() {
  const data = _interopRequireDefault(require("@babel/template"));
  _template = () => data;
  return data;
}

// Import additional configuration-related modules
const _item = require("./config/item");
const _config = require("./config");
const _transform = require("./transform");
const _transformFile = require("./transform-file");
const _transformAst = require("./transform-ast");
const _parse = require("./parse");

// Helper function to deal with namespace imports
function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  const cache = new WeakMap();
  _getRequireWildcardCache = () => cache;
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) return obj;
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") return { default: obj };
  const cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) return cache.get(obj);
  const newObj = {};
  const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
      else newObj[key] = obj[key];
    }
  }
  newObj.default = obj;
  if (cache) cache.set(obj, newObj);
  return newObj;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Define a constant for default file extensions
const DEFAULT_EXTENSIONS = Object.freeze([".js", ".jsx", ".es6", ".es", ".mjs"]);
exports.DEFAULT_EXTENSIONS = DEFAULT_EXTENSIONS;

// Define OptionManager class with initialization method
class OptionManager {
  init(opts) {
    return _config.loadOptions(opts);
  }
}

exports.OptionManager = OptionManager;

// Plugin function which throws an error for unsupported Babel version
function Plugin(alias) {
  throw new Error(`The (${alias}) Babel 5 plugin is being run with an unsupported Babel version.`);
}
