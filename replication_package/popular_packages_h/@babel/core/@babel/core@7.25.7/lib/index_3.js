"use strict";

import fileDefault from './transformation/file/file.js';
import buildExternalHelpersDefault from './tools/build-external-helpers.js';
import { createConfigItem, createConfigItemAsync, createConfigItemSync, loadOptions, loadOptionsAsync, loadOptionsSync, loadPartialConfig, loadPartialConfigAsync, loadPartialConfigSync, resolvePlugin, resolvePreset } from './config/index.js';
import { getEnv } from './config/helpers/environment.js';
import { parse, parseAsync, parseSync } from './parse.js';
import { transform, transformAsync, transformSync } from './transform.js';
import { transformFile, transformFileAsync, transformFileSync } from './transform-file.js';
import { transformFromAst, transformFromAstAsync, transformFromAstSync } from './transform-ast.js';
import typesData from '@babel/types';
import parserData from '@babel/parser';
import traverseData from '@babel/traverse';
import templateData from '@babel/template';

export {
  fileDefault as File,
  buildExternalHelpersDefault as buildExternalHelpers,
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
  templateData as template,
  parserData.tokTypes as tokTypes,
  transform,
  transformAsync,
  transformSync,
  transformFile,
  transformFileAsync,
  transformFileSync,
  transformFromAst,
  transformFromAstAsync,
  transformFromAstSync,
  traverseData as traverse,
  typesData as types
};

export const version = "7.25.7";

export const DEFAULT_EXTENSIONS = Object.freeze([".js", ".jsx", ".es6", ".es", ".mjs", ".cjs"]);

export class OptionManager {
  init(opts) {
    return loadOptionsSync(opts);
  }
}

export function Plugin(alias) {
  throw new Error(`The (${alias}) Babel 5 plugin is being run with an unsupported Babel version.`);
}
