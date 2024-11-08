'use strict';

const crypto = require('crypto');
const path = require('path');
const { transformSync } = require('@babel/core');
const chalk = require('chalk').default;
const fs = require('graceful-fs');
const slash = require('slash').default;
const { loadPartialConfig } = require('./loadBabelConfig');

// Read the current file for creating a cache key
const THIS_FILE = fs.readFileSync(__filename);
const jestPresetPath = require.resolve('babel-preset-jest');
const babelIstanbulPlugin = require.resolve('babel-plugin-istanbul');

// Create the Babel transformer
const createTransformer = (userOptions = {}) => {
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
    plugins: userOptions.plugins || [],
    presets: (userOptions.presets || []).concat(jestPresetPath),
    sourceMaps: 'both'
  };

  const loadBabelConfig = (cwd, filename, transformOptions) => {
    const babelConfig = loadPartialConfig({
      cwd,
      ...options,
      caller: {
        ...options.caller,
        ...transformOptions
      },
      filename
    });

    if (!babelConfig) {
      throw new Error(`babel-jest: Babel ignores ${chalk.bold(slash(path.relative(cwd, filename)))} - make sure to include the file in Jest's ${chalk.bold('transformIgnorePatterns')} as well.`);
    }

    return babelConfig;
  };

  return {
    canInstrument: true,

    getCacheKey(sourceText, sourcePath, transformOptions) {
      const { config, configString, instrument } = transformOptions;
      const babelOptions = loadBabelConfig(config.cwd, sourcePath, transformOptions);
      const configPath = [babelOptions.config || '', babelOptions.babelrc || ''];
      return crypto.createHash('md5')
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
        .digest('hex');
    },

    process(sourceText, sourcePath, transformOptions) {
      const babelOptions = { ...loadBabelConfig(transformOptions.config.cwd, sourcePath, transformOptions).options };

      if (transformOptions.instrument) {
        babelOptions.auxiliaryCommentBefore = ' istanbul ignore next ';
        babelOptions.plugins = (babelOptions.plugins || []).concat([
          [
            babelIstanbulPlugin,
            {
              cwd: transformOptions.config.rootDir,
              exclude: []
            }
          ]
        ]);
      }

      const transformResult = transformSync(sourceText, babelOptions);
      return transformResult ? { code: transformResult.code, map: transformResult.map } : sourceText;
    }
  };
};

module.exports = { ...createTransformer(), createTransformer };
