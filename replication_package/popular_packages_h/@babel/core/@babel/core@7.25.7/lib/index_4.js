"use strict";

import File from './transformation/file/file.js';
import buildExternalHelpers from './tools/build-external-helpers.js';
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
} from './config/index.js';

import { getEnv } from './config/helpers/environment.js';
import { parse, parseAsync, parseSync } from './parse.js';
import {
  transform,
  transformAsync,
  transformSync
} from './transform.js';
import {
  transformFile,
  transformFileAsync,
  transformFileSync
} from './transform-file.js';
import {
  transformFromAst,
  transformFromAstAsync,
  transformFromAstSync
} from './transform-ast.js';

let _types = null;
function types() {
  if (!_types) _types = require('@babel/types');
  return _types;
}

let _parser = null;
function parser() {
  if (!_parser) _parser = require('@babel/parser');
  return _parser;
}

let _traverse = null;
function traverse() {
  if (!_traverse) _traverse = require('@babel/traverse');
  return _traverse;
}

let _template = null;
function template() {
  if (!_template) _template = require('@babel/template');
  return _template;
}

export const version = "7.25.7";

export const DEFAULT_EXTENSIONS = Object.freeze([
  ".js", ".jsx", ".es6", ".es", ".mjs", ".cjs"
]);

export {
  File,
  buildExternalHelpers,
  createConfigItem,
  createConfigItemAsync,
  createConfigItemSync,
  getEnv,
  loadOptions,
  loadOptionsAsync,
  loadOptionsSync,
  loadPartialConfig,
  loadPartialConfigAsync,
  loadPartialConfigSync,
  parse,
  parseAsync,
  parseSync,
  resolvePlugin,
  resolvePreset,
  template,
  types,
  traverse,
  transform,
  transformAsync,
  transformFile,
  transformFileAsync,
  transformFileSync,
  transformFromAst,
  transformFromAstAsync,
  transformFromAstSync,
  transformSync,
};

// Exporting classes and functions with additional logic
export class OptionManager {
  init(opts) {
    return loadOptionsSync(opts);
  }
}

export function Plugin(alias) {
  throw new Error(`The (${alias}) Babel 5 plugin is being run with an unsupported Babel version.`);
}
