'use strict';

const crypto = require('crypto');
const path = require('path');
const { transformSync } = require('@babel/core');
const chalk = require('chalk').default;
const fs = require('graceful-fs');
const slash = require('slash').default;
const { loadPartialConfig } = require('./loadBabelConfig');

const THIS_FILE = fs.readFileSync(__filename);

const jestPresetPath = require.resolve('babel-preset-jest');
const babelIstanbulPlugin = require.resolve('babel-plugin-istanbul');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  const cache = new WeakMap();
  _getRequireWildcardCache = () => cache;
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj };
  }
  const cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  const newObj = {};
  const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

const createTransformer = (userOptions = {}) => {
  const options = {
    ...userOptions,
    caller: {
      name: 'babel-jest',
      supportsDynamicImport: false,
      supportsExportNamespaceFrom: false,
      supportsStaticESM: false,
      supportsTopLevelAwait: false,
      ...userOptions.caller,
    },
    compact: false,
    plugins: userOptions.plugins || [],
    presets: (userOptions.presets || []).concat(jestPresetPath),
    sourceMaps: 'both',
  };

  function loadBabelConfig(cwd, filename, transformOptions) {
    const {
      supportsDynamicImport,
      supportsExportNamespaceFrom,
      supportsStaticESM,
      supportsTopLevelAwait,
    } = transformOptions;

    const babelConfig = loadPartialConfig({
      cwd,
      ...options,
      caller: {
        ...options.caller,
        supportsDynamicImport: supportsDynamicImport ?? options.caller.supportsDynamicImport,
        supportsExportNamespaceFrom: supportsExportNamespaceFrom ?? options.caller.supportsExportNamespaceFrom,
        supportsStaticESM: supportsStaticESM ?? options.caller.supportsStaticESM,
        supportsTopLevelAwait: supportsTopLevelAwait ?? options.caller.supportsTopLevelAwait,
      },
      filename,
    });

    if (!babelConfig) {
      throw new Error(
        `babel-jest: Babel ignores ${chalk.bold(slash(path.relative(cwd, filename)))} - make sure to include the file in Jest's ${chalk.bold('transformIgnorePatterns')} as well.`
      );
    }

    return babelConfig;
  }

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
      const babelOptions = {
        ...loadBabelConfig(transformOptions.config.cwd, sourcePath, transformOptions).options,
      };

      if (transformOptions?.instrument) {
        babelOptions.auxiliaryCommentBefore = ' istanbul ignore next ';
        babelOptions.plugins = (babelOptions.plugins || []).concat([
          [babelIstanbulPlugin, { cwd: transformOptions.config.rootDir, exclude: [] }],
        ]);
      }

      const transformResult = transformSync(sourceText, babelOptions);

      if (transformResult) {
        const { code, map } = transformResult;

        if (typeof code === 'string') {
          return { code, map };
        }
      }

      return sourceText;
    },
  };
};

const transformer = {
  ...createTransformer(),
  createTransformer
};
module.exports = transformer;
