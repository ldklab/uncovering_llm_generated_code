"use strict";

import File from './transformation/file/file';
import buildExternalHelpers from './tools/build-external-helpers';
import { resolvePlugin, resolvePreset } from './config/files';
import { version } from '../package.json';
import { getEnv } from './config/helpers/environment';
import * as babelTypes from '@babel/types';
import { tokTypes } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import babelTemplate from '@babel/template';
import { createConfigItem } from './config/item';
import { loadPartialConfig, loadPartialConfigSync, loadPartialConfigAsync, loadOptions, loadOptionsSync, loadOptionsAsync } from './config';
import { transform, transformSync, transformAsync } from './transform';
import { transformFile, transformFileSync, transformFileAsync } from './transform-file';
import { transformFromAst, transformFromAstSync, transformFromAstAsync } from './transform-ast';
import { parse, parseSync, parseAsync } from './parse';

export const DEFAULT_EXTENSIONS = Object.freeze([".js", ".jsx", ".es6", ".es", ".mjs"]);

export class OptionManager {
  init(opts) {
    return loadOptions(opts);
  }
}

export function Plugin(alias) {
  throw new Error(`The (${alias}) Babel 5 plugin is being run with an unsupported Babel version.`);
}

export { File, buildExternalHelpers, resolvePlugin, resolvePreset, version, getEnv, babelTypes as types, tokTypes, babelTraverse as traverse, babelTemplate as template, createConfigItem, loadPartialConfig, loadPartialConfigSync, loadPartialConfigAsync, loadOptions, loadOptionsSync, loadOptionsAsync, transform, transformSync, transformAsync, transformFile, transformFileSync, transformFileAsync, transformFromAst, transformFromAstSync, transformFromAstAsync, parse, parseSync, parseAsync };
