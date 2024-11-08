'use strict';
const path = require('path');
const postcss = require('postcss');
const { lilconfigSync } = require('lilconfig');

const cssnano = 'cssnano';

/**
 * Checks if a module id is resolvable, returning a boolean.
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
 * Resolves the preset to use for cssnano based on the given configuration.
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
 * Resolves cssnano configuration, prioritizing direct options or external file configurations.
 * @param {Object} options
 */
function resolveConfig(options) {
  if (options.preset) {
    return resolvePreset(options.preset);
  }

  let searchPath = process.cwd();
  let configPath;

  if (options.configFile) {
    searchPath = undefined;
    configPath = path.resolve(process.cwd(), options.configFile);
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

  const config = configPath
    ? configExplorer.load(configPath)
    : configExplorer.search(searchPath);

  if (!config) {
    return resolvePreset('default');
  }

  return resolvePreset(config.config.preset || config.config);
}

/**
 * Main function for creating the cssnano PostCSS plugin with the provided options.
 * @type {import('postcss').PluginCreator<Object>}
 * @param {Object=} options
 * @return {import('postcss').Processor}
 */
function cssnanoPlugin(options = {}) {
  if (Array.isArray(options.plugins)) {
    if (!options.preset || !options.preset.plugins) {
      options.preset = { plugins: [] };
    }

    for (const plugin of options.plugins) {
      const [pluginDef, opts = {}] = Array.isArray(plugin) ? plugin : [plugin, {}];
      if (typeof pluginDef === 'string' && isResolvable(pluginDef)) {
        options.preset.plugins.push([require(pluginDef), opts]);
      } else {
        options.preset.plugins.push([pluginDef, opts]);
      }
    }
  }

  const plugins = [];
  const nanoPlugins = resolveConfig(options);

  for (const nanoPlugin of nanoPlugins) {
    if (Array.isArray(nanoPlugin)) {
      const [processor, opts] = nanoPlugin;
      if (!opts || !opts.exclude || opts === true) {
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
