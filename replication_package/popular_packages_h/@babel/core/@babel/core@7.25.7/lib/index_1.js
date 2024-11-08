"use strict";

// Import dependencies
var _file = require("./transformation/file/file.js");
var _buildExternalHelpers = require("./tools/build-external-helpers.js");
var _index = require("./config/files/index.js");
var _environment = require("./config/helpers/environment.js");
var _index2 = require("./config/index.js");
var _transform = require("./transform.js");
var _transformFile = require("./transform-file.js");
var _transformAst = require("./transform-ast.js");
var _parse = require("./parse.js");
var thisFile = require("./index.js");

// Dynamic imports with caching mechanisms
function _types() {
  const data = require("@babel/types");
  _types = function () {
    return data;
  };
  return data;
}

function _parser() {
  const data = require("@babel/parser");
  _parser = function () {
    return data;
  };
  return data;
}

function _traverse() {
  const data = require("@babel/traverse");
  _traverse = function () {
    return data;
  };
  return data;
}

function _template() {
  const data = require("@babel/template");
  _template = function () {
    return data;
  };
  return data;
}

// Export constants
const version = exports.version = "7.25.7";
const DEFAULT_EXTENSIONS = exports.DEFAULT_EXTENSIONS = Object.freeze([".js", ".jsx", ".es6", ".es", ".mjs", ".cjs"]);

// Export functionalities
Object.defineProperty(exports, "__esModule", { value: true });

exports.DEFAULT_EXTENSIONS = DEFAULT_EXTENSIONS;

Object.defineProperty(exports, "File", { enumerable: true, get: () => _file.default });
Object.defineProperty(exports, "buildExternalHelpers", { enumerable: true, get: () => _buildExternalHelpers.default });
Object.defineProperty(exports, "createConfigItem", { enumerable: true, get: () => _index2.createConfigItem });
Object.defineProperty(exports, "createConfigItemAsync", { enumerable: true, get: () => _index2.createConfigItemAsync });
Object.defineProperty(exports, "createConfigItemSync", { enumerable: true, get: () => _index2.createConfigItemSync });
Object.defineProperty(exports, "getEnv", { enumerable: true, get: () => _environment.getEnv });
Object.defineProperty(exports, "loadOptions", { enumerable: true, get: () => _index2.loadOptions });
Object.defineProperty(exports, "loadOptionsAsync", { enumerable: true, get: () => _index2.loadOptionsAsync });
Object.defineProperty(exports, "loadOptionsSync", { enumerable: true, get: () => _index2.loadOptionsSync });
Object.defineProperty(exports, "loadPartialConfig", { enumerable: true, get: () => _index2.loadPartialConfig });
Object.defineProperty(exports, "loadPartialConfigAsync", { enumerable: true, get: () => _index2.loadPartialConfigAsync });
Object.defineProperty(exports, "loadPartialConfigSync", { enumerable: true, get: () => _index2.loadPartialConfigSync });
Object.defineProperty(exports, "parse", { enumerable: true, get: () => _parse.parse });
Object.defineProperty(exports, "parseAsync", { enumerable: true, get: () => _parse.parseAsync });
Object.defineProperty(exports, "parseSync", { enumerable: true, get: () => _parse.parseSync });
Object.defineProperty(exports, "resolvePlugin", { enumerable: true, get: () => _index.resolvePlugin });
Object.defineProperty(exports, "resolvePreset", { enumerable: true, get: () => _index.resolvePreset });
Object.defineProperty(exports, "transform", { enumerable: true, get: () => _transform.transform });
Object.defineProperty(exports, "transformAsync", { enumerable: true, get: () => _transform.transformAsync });
Object.defineProperty(exports, "transformFile", { enumerable: true, get: () => _transformFile.transformFile });
Object.defineProperty(exports, "transformFileAsync", { enumerable: true, get: () => _transformFile.transformFileAsync });
Object.defineProperty(exports, "transformFileSync", { enumerable: true, get: () => _transformFile.transformFileSync });
Object.defineProperty(exports, "transformFromAst", { enumerable: true, get: () => _transformAst.transformFromAst });
Object.defineProperty(exports, "transformFromAstAsync", { enumerable: true, get: () => _transformAst.transformFromAstAsync });
Object.defineProperty(exports, "transformFromAstSync", { enumerable: true, get: () => _transformAst.transformFromAstSync });
Object.defineProperty(exports, "transformSync", { enumerable: true, get: () => _transform.transformSync });

Object.defineProperty(exports, "types", { enumerable: true, get: () => _types() });
Object.defineProperty(exports, "template", { enumerable: true, get: () => _template().default });
Object.defineProperty(exports, "tokTypes", { enumerable: true, get: () => _parser().tokTypes });
Object.defineProperty(exports, "traverse", { enumerable: true, get: () => _traverse().default });

// Class and function definitions
exports.OptionManager = class OptionManager {
  init(opts) {
    return _index2.loadOptionsSync(opts);
  }
};

exports.Plugin = function Plugin(alias) {
  throw new Error(`The (${alias}) Babel 5 plugin is being run with an unsupported Babel version.`);
};

0 && (exports.types = exports.traverse = exports.tokTypes = exports.template = 0);
