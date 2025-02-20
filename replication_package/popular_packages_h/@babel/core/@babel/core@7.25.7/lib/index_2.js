"use strict";

// Export constants and version
export const DEFAULT_EXTENSIONS = Object.freeze([".js", ".jsx", ".es6", ".es", ".mjs", ".cjs"]);
export const version = "7.25.7";

// Import internal modules
import File from "./transformation/file/file.js";
import buildExternalHelpers from "./tools/build-external-helpers.js";
import { 
  createConfigItem, 
  createConfigItemAsync, 
  createConfigItemSync, 
  loadOptions, 
  loadOptionsAsync, 
  loadOptionsSync, 
  loadPartialConfig, 
  loadPartialConfigAsync, 
  loadPartialConfigSync,
  resolvePlugin, 
  resolvePreset 
} from "./config/index.js";
import { loadOptionsSync as loadOptionsSyncIndex } from "./config/files/index.js";
import { getEnv } from "./config/helpers/environment.js";
import * as Parse from "./parse.js";
import * as Transform from "./transform.js";
import * as TransformFile from "./transform-file.js";
import * as TransformAst from "./transform-ast.js";

// Import Babel packages
import * as Types from "@babel/types";
import * as Parser from "@babel/parser";
import * as Traverse from "@babel/traverse";
import * as Template from "@babel/template";

// Export functions and classes
export { 
  File as File,
  buildExternalHelpers as buildExternalHelpers,
  createConfigItem as createConfigItem,
  createConfigItemAsync as createConfigItemAsync,
  createConfigItemSync as createConfigItemSync,
  getEnv as getEnv,
  loadOptions as loadOptions,
  loadOptionsAsync as loadOptionsAsync,
  loadOptionsSync as loadOptionsSync,
  loadPartialConfig as loadPartialConfig,
  loadPartialConfigAsync as loadPartialConfigAsync,
  loadPartialConfigSync as loadPartialConfigSync,
  Parse.parse as parse,
  Parse.parseAsync as parseAsync,
  Parse.parseSync as parseSync,
  resolvePlugin as resolvePlugin,
  resolvePreset as resolvePreset,
  Template.default as template,
  Parser.tokTypes as tokTypes,
  Transform.transform as transform,
  Transform.transformAsync as transformAsync,
  Transform.transformSync as transformSync,
  TransformFile.transformFile as transformFile,
  TransformFile.transformFileAsync as transformFileAsync,
  TransformFile.transformFileSync as transformFileSync,
  TransformAst.transformFromAst as transformFromAst,
  TransformAst.transformFromAstAsync as transformFromAstAsync,
  TransformAst.transformFromAstSync as transformFromAstSync,
  Traverse.default as traverse,
  Types as types
};

// Conditional additional exports (currently not operational)
0 && (exports.types = exports.traverse = exports.tokTypes = exports.template = 0);

// Export additional classes
export class OptionManager {
  init(opts) {
    return loadOptionsSyncIndex(opts);
  }
}

export function Plugin(alias) {
  throw new Error(`The (${alias}) Babel 5 plugin is being run with an unsupported Babel version.`);
}
