'use strict';
const path = require('path');
const postcss = require('postcss');
const { lilconfigSync } = require('lilconfig');

// Module for CSS optimization
const cssnano = 'cssnano';

/** @typedef {{preset?: any, plugins?: any[], configFile?: string}} Options */

/**
 * Checks if a module ID can be resolved.
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
 * Resolve a given preset to PostCSS plugin format.
 * @param {any} preset
 * @return {[import('postcss').PluginCreator<any>, boolean | Record<string, any> | undefined][]}
 */
function resolvePreset(preset) {
  let fn, options;

  if (Array.isArray(preset)) {
    fn = preset[0];
    options = preset[1];
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
 * Resolves configuration for cssnano.
 * @param {Options} options
 */
function resolveConfig(options) {
  if (options.preset) {
    return resolvePreset(options.preset);
  }

  let searchPath = process.cwd();
  let configPath;

  if (options.configFile) {
    configPath = path.resolve(process.cwd(), options.configFile);
    searchPath = undefined;
  }

  const configExplorer = lilconfigSync(cssnano, {
    searchPlaces: [
      'package.json',
      '.cssnanorc',
      '.cssnanorc.json',
      '.cssnanorc.js',
      'cssnano.config.js',
    ],
  });

  const config = configPath ? configExplorer.load(configPath) : configExplorer.search(searchPath);

  if (config === null) {
    return resolvePreset('default');
  }

  return resolvePreset(config.config.preset || config.config);
}

/**
 * PostCSS plugin for optimizing CSS with cssnano.
 * @param {Options=} options
 * @return {import('postcss').Processor}
 */
function cssnanoPlugin(options = {}) {
  if (Array.isArray(options.plugins)) {
    if (!options.preset || !options.preset.plugins) {
      options.preset = { plugins: [] };
    }

    options.plugins.forEach((plugin) => {
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

  const plugins = [];
  const nanoPlugins = resolveConfig(options);

  for (const nanoPlugin of nanoPlugins) {
    if (Array.isArray(nanoPlugin)) {
      const [processor, opts] = nanoPlugin;
      if (
        typeof opts === 'undefined' ||
        (typeof opts === 'object' && !opts.exclude) ||
        opts === true
      ) {
        plugins.push(processor(opts));
      }
    } else {
      plugins.push(nanoPlugin);
    }
  }

  return postcss(plugins);
}

cssnanoPlugin.postcss = true;
module.exports = cssnanoPlugin;
