'use strict';

import { createHash } from 'crypto';
import * as path from 'path';
import { transformSync, transformAsync } from '@babel/core';
import chalk from 'chalk';
import * as fs from 'graceful-fs';
import slash from 'slash';
import { loadPartialConfig, loadPartialConfigAsync } from './loadBabelConfig';

const THIS_FILE = fs.readFileSync(__filename, 'utf8');
const jestPresetPath = require.resolve('babel-preset-jest');
const babelIstanbulPlugin = require.resolve('babel-plugin-istanbul');

function assertLoadedBabelConfig(config, cwd, filename) {
  if (!config) {
    const relativePath = slash(path.relative(cwd, filename));
    throw new Error(`babel-jest: Babel skips ${chalk.bold(relativePath)} - ensure it is included in Jest's ${chalk.bold('transformIgnorePatterns')}.`);
  }
}

function addIstanbulInstrumentation(babelOptions, transformOptions) {
  if (transformOptions.instrument) {
    const options = { ...babelOptions, auxiliaryCommentBefore: ' istanbul ignore next ' };
    options.plugins = [...(options.plugins ?? []), [babelIstanbulPlugin, { cwd: transformOptions.config.cwd, exclude: [] }]];
    return options;
  }
  return babelOptions;
}

function buildCacheKey(sourceText, sourcePath, babelOptions, transformOptions) {
  const { config, configString, instrument } = transformOptions;
  const configPath = [babelOptions.config ?? '', babelOptions.babelrc ?? ''];
  return createHash('sha1')
    .update(THIS_FILE)
    .update('\0')
    .update(JSON.stringify(babelOptions.options))
    .update('\0')
    .update(sourceText)
    .update('\0')
    .update(path.relative(config.rootDir, sourcePath))
    .update('\0')
    .update(configString)
    .update('\0')
    .update(configPath.join(''))
    .update('\0')
    .update(instrument ? 'instrument' : '')
    .update('\0')
    .update(process.env.NODE_ENV ?? '')
    .update('\0')
    .update(process.env.BABEL_ENV ?? '')
    .update('\0')
    .update(process.version)
    .digest('hex')
    .substring(0, 32);
}

function loadBabelOptions(cwd, filename, transformOptions, jestTransformOptions) {
  const { options } = loadPartialConfig(transformOptions);
  assertLoadedBabelConfig(options, cwd, filename);
  return addIstanbulInstrumentation(options, jestTransformOptions);
}

async function loadBabelOptionsAsync(cwd, filename, transformOptions, jestTransformOptions) {
  const { options } = await loadPartialConfigAsync(transformOptions);
  assertLoadedBabelConfig(options, cwd, filename);
  return addIstanbulInstrumentation(options, jestTransformOptions);
}

export function createTransformer(userOptions = {}) {
  const options = {
    ...userOptions,
    caller: {
      name: 'babel-jest',
      supportsDynamicImport: false,
      supportsExportNamespaceFrom: false,
      supportsStaticESM: false,
      supportsTopLevelAwait: false,
      ...userOptions.caller
    },
    compact: false,
    plugins: userOptions.plugins ?? [],
    presets: [...(userOptions.presets ?? []), jestPresetPath],
    sourceMaps: 'both'
  };

  function getBabelTransformOptions(filename, transformOptions) {
    const { cwd, rootDir } = transformOptions.config;
    return {
      cwd,
      root: rootDir,
      ...options,
      caller: {
        ...options.caller,
        supportsDynamicImport: transformOptions.supportsDynamicImport ?? options.caller.supportsDynamicImport,
        supportsExportNamespaceFrom: transformOptions.supportsExportNamespaceFrom ?? options.caller.supportsExportNamespaceFrom,
        supportsStaticESM: transformOptions.supportsStaticESM ?? options.caller.supportsStaticESM,
        supportsTopLevelAwait: transformOptions.supportsTopLevelAwait ?? options.caller.supportsTopLevelAwait
      },
      filename
    };
  }

  return {
    canInstrument: true,

    getCacheKey(sourceText, sourcePath, transformOptions) {
      const babelOptions = loadPartialConfig({
        ...transformOptions,
        ...getBabelTransformOptions(sourcePath, transformOptions)
      });
      return buildCacheKey(sourceText, sourcePath, babelOptions, transformOptions);
    },

    async getCacheKeyAsync(sourceText, sourcePath, transformOptions) {
      const babelOptions = await loadPartialConfigAsync({
        ...transformOptions,
        ...getBabelTransformOptions(sourcePath, transformOptions)
      });
      return buildCacheKey(sourceText, sourcePath, babelOptions, transformOptions);
    },

    process(sourceText, sourcePath, transformOptions) {
      const babelOptions = loadBabelOptions(transformOptions.config.cwd, sourcePath, getBabelTransformOptions(sourcePath, transformOptions), transformOptions);
      const transformResult = transformSync(sourceText, babelOptions);
      return transformResult ? { code: transformResult.code, map: transformResult.map } : { code: sourceText };
    },

    async processAsync(sourceText, sourcePath, transformOptions) {
      const babelOptions = await loadBabelOptionsAsync(transformOptions.config.cwd, sourcePath, getBabelTransformOptions(sourcePath, transformOptions), transformOptions);
      const transformResult = await transformAsync(sourceText, babelOptions);
      return transformResult ? { code: transformResult.code, map: transformResult.map } : { code: sourceText };
    }
  };
}

export default { createTransformer };
