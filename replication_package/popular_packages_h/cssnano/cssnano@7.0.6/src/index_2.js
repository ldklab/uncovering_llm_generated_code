'use strict';
const path = require('path');
const postcss = require('postcss');
const { lilconfigSync } = require('lilconfig');

const cssnano = 'cssnano';

/**
 * Check if a module can be required.
 * @param {string} moduleId
 * @returns {boolean}
 */
function isResolvable(moduleId) {
  try {
    require.resolve(moduleId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve and return plugins for a preset.
 * @param {any} preset
 * @return {[import('postcss').PluginCreator<any>, boolean | Record<string, any> | undefined][]}
 */
function resolvePreset(preset) {
  let fn, options;

  if (Array.isArray(preset)) {
    [fn, options = {}] = preset;
  } else {
    fn = preset;
    options = {};
  }

  if (fn.plugins) {
    return fn.plugins;
  }

  if (fn === 'default') {
    return require('cssnano-preset-default')(options).plugins;
  }

  if (typeof fn === 'function') {
    return fn(options).plugins;
  }

  if (isResolvable(fn)) {
    return require(fn)(options).plugins;
  }

  const sugar = `cssnano-preset-${fn}`;
  if (isResolvable(sugar)) {
    return require(sugar)(options).plugins;
  }

  throw new Error(`Cannot load preset "${fn}". Please check your configuration for errors and try again.`);
}

/**
 * Get the configuration for cssnano.
 * @param {Object} options
 * @property {string} [options.configFile]
 * @property {any} [options.preset]
 */
function resolveConfig(options) {
  if (options.preset) {
    return resolvePreset(options.preset);
  }

  const searchPath = process.cwd();
  const configExplorer = lilconfigSync(cssnano, {
    searchPlaces: [
      'package.json',
      '.cssnanorc',
      '.cssnanorc.json',
      '.cssnanorc.js',
      'cssnano.config.js',
    ],
  });
  const config = options.configFile ?
    configExplorer.load(path.resolve(process.cwd(), options.configFile)) :
    configExplorer.search(searchPath);

  if (config === null) {
    return resolvePreset('default');
  }

  return resolvePreset(config.config.preset || config.config);
}

/**
 * Create a new instance of the cssnano plugin.
 * @type {import('postcss').PluginCreator<{preset?: any, plugins?: any[], configFile?: string}>}
 */
function cssnanoPlugin(options = {}) {
  if (Array.isArray(options.plugins)) {
    if (!options.preset) {
      options.preset = { plugins: [] };
    }

    options.plugins.forEach(plugin => {
      if (Array.isArray(plugin)) {
        const [pluginDef, opts = {}] = plugin;
        if (typeof pluginDef === 'string' && isResolvable(pluginDef)) {
          options.preset.plugins.push([require(pluginDef), opts]);
        } else {
          options.preset.plugins.push([pluginDef, opts]);
        }
      } else if (typeof plugin === 'string' && isResolvable(plugin)) {
        options.preset.plugins.push([require(plugin), {}]);
      } else {
        options.preset.plugins.push([plugin, {}]);
      }
    });
  }

  const plugins = resolveConfig(options).map(([processor, opts]) => {
    if (!opts || (typeof opts === 'object' && !opts.exclude) || opts === true) {
      return processor(opts);
    }
    return null;
  }).filter(Boolean);

  return postcss(plugins);
}

cssnanoPlugin.postcss = true;
module.exports = cssnanoPlugin;
