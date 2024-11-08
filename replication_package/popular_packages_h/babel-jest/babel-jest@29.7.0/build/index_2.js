'use strict';

const crypto = require('crypto');
const path = require('path');
const babelCore = require('@babel/core');
const chalk = require('chalk');
const fs = require('graceful-fs');
const slash = require('slash');
const { loadPartialConfig, loadPartialConfigAsync } = require('./loadBabelConfig');

const THIS_FILE = fs.readFileSync(__filename);
const jestPresetPath = require.resolve('babel-preset-jest');
const babelIstanbulPlugin = require.resolve('babel-plugin-istanbul');

function assertLoadedBabelConfig(babelConfig, cwd, filename) {
  if (!babelConfig) {
    throw new Error(
      `babel-jest: Babel ignores ${chalk.bold(slash(path.relative(cwd, filename)))} - ` +
      `make sure to include the file in Jest's ${chalk.bold('transformIgnorePatterns')} as well.`
    );
  }
}

function addIstanbulInstrumentation(babelOptions, transformOptions) {
  if (transformOptions.instrument) {
    return {
      ...babelOptions,
      auxiliaryCommentBefore: ' istanbul ignore next ',
      plugins: [
        ...(babelOptions.plugins || []),
        [babelIstanbulPlugin, { cwd: transformOptions.config.cwd, exclude: [] }],
      ],
    };
  }
  return babelOptions;
}

function getCacheKeyFromConfig(sourceText, sourcePath, babelOptions, transformOptions) {
  const { config, configString, instrument } = transformOptions;
  const configPath = [babelOptions.config || '', babelOptions.babelrc || ''];
  return crypto.createHash('sha1')
    .update(THIS_FILE)
    .update('\0', 'utf8')
    .update(JSON.stringify(babelOptions.options))
    .update('\0', 'utf8')
    .update(sourceText)
    .update('\0', 'utf8')
    .update(path.relative(config.rootDir, sourcePath))
    .update('\0', 'utf8')
    .update(configString)
    .update('\0', 'utf8')
    .update(configPath.join(''))
    .update('\0', 'utf8')
    .update(instrument ? 'instrument' : '')
    .update('\0', 'utf8')
    .update(process.env.NODE_ENV || '')
    .update('\0', 'utf8')
    .update(process.env.BABEL_ENV || '')
    .update('\0', 'utf8')
    .update(process.version)
    .digest('hex')
    .substring(0, 32);
}

function loadBabelConfig(cwd, filename, transformOptions) {
  const babelConfig = loadPartialConfig(transformOptions);
  assertLoadedBabelConfig(babelConfig, cwd, filename);
  return babelConfig;
}

async function loadBabelConfigAsync(cwd, filename, transformOptions) {
  const babelConfig = await loadPartialConfigAsync(transformOptions);
  assertLoadedBabelConfig(babelConfig, cwd, filename);
  return babelConfig;
}

function loadBabelOptions(cwd, filename, transformOptions, jestTransformOptions) {
  const { options } = loadBabelConfig(cwd, filename, transformOptions);
  return addIstanbulInstrumentation(options, jestTransformOptions);
}

async function loadBabelOptionsAsync(cwd, filename, transformOptions, jestTransformOptions) {
  const { options } = await loadBabelConfigAsync(cwd, filename, transformOptions);
  return addIstanbulInstrumentation(options, jestTransformOptions);
}

const createTransformer = userOptions => {
  const inputOptions = userOptions || {};
  const options = {
    ...inputOptions,
    caller: {
      name: 'babel-jest',
      supportsDynamicImport: false,
      supportsExportNamespaceFrom: false,
      supportsStaticESM: false,
      supportsTopLevelAwait: false,
      ...inputOptions.caller
    },
    compact: false,
    plugins: inputOptions.plugins || [],
    presets: [...(inputOptions.presets || []), jestPresetPath],
    sourceMaps: 'both',
  };

  function mergeBabelTransformOptions(filename, transformOptions) {
    const { cwd, rootDir } = transformOptions.config;
    return {
      cwd,
      root: rootDir,
      ...options,
      caller: {
        ...options.caller,
        supportsDynamicImport: transformOptions.supportsDynamicImport || options.caller.supportsDynamicImport,
        supportsExportNamespaceFrom: transformOptions.supportsExportNamespaceFrom || options.caller.supportsExportNamespaceFrom,
        supportsStaticESM: transformOptions.supportsStaticESM || options.caller.supportsStaticESM,
        supportsTopLevelAwait: transformOptions.supportsTopLevelAwait || options.caller.supportsTopLevelAwait,
      },
      filename,
    };
  }

  return {
    canInstrument: true,
    getCacheKey(sourceText, sourcePath, transformOptions) {
      const babelOptions = loadBabelConfig(transformOptions.config.cwd, sourcePath, mergeBabelTransformOptions(sourcePath, transformOptions));
      return getCacheKeyFromConfig(sourceText, sourcePath, babelOptions, transformOptions);
    },
    async getCacheKeyAsync(sourceText, sourcePath, transformOptions) {
      const babelOptions = await loadBabelConfigAsync(transformOptions.config.cwd, sourcePath, mergeBabelTransformOptions(sourcePath, transformOptions));
      return getCacheKeyFromConfig(sourceText, sourcePath, babelOptions, transformOptions);
    },
    process(sourceText, sourcePath, transformOptions) {
      const babelOptions = loadBabelOptions(transformOptions.config.cwd, sourcePath, mergeBabelTransformOptions(sourcePath, transformOptions), transformOptions);
      const transformResult = babelCore.transformSync(sourceText, babelOptions);
      if (transformResult) {
        const { code, map } = transformResult;
        if (typeof code === 'string') {
          return { code, map };
        }
      }
      return { code: sourceText };
    },
    async processAsync(sourceText, sourcePath, transformOptions) {
      const babelOptions = await loadBabelOptionsAsync(transformOptions.config.cwd, sourcePath, mergeBabelTransformOptions(sourcePath, transformOptions), transformOptions);
      const transformResult = await babelCore.transformAsync(sourceText, babelOptions);
      if (transformResult) {
        const { code, map } = transformResult;
        if (typeof code === 'string') {
          return { code, map };
        }
      }
      return { code: sourceText };
    },
  };
};

module.exports = {
  createTransformer,
  default: { createTransformer },
};
