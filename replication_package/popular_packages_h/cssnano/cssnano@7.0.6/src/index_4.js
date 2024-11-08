'use strict';
const path = require('path');
const postcss = require('postcss');
const { lilconfigSync } = require('lilconfig');

const cssnano = 'cssnano';

/** @typedef {{preset?: any, plugins?: any[], configFile?: string}} Options */

/**
 * Check if a module ID is resolvable
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
 * Resolve the appropriate preset for cssnano configuration
 * @param {any} preset
 * @returns {[import('postcss').PluginCreator<any>, boolean | Record<string, any> | undefined][]}
 */
function resolvePreset(preset) {
  let fn, options;
  
  if (Array.isArray(preset)) {
    [fn, options] = preset;
  } else {
    fn = preset;
    options = {};
  }
  
  if (fn.plugins) return fn.plugins;
  if (fn === 'default') return require('cssnano-preset-default')(options).plugins;
  if (typeof fn === 'function') return fn(options).plugins;
  if (isResolvable(fn)) return require(fn)(options).plugins;
  
  const presetName = `cssnano-preset-${fn}`;
  if (isResolvable(presetName)) return require(presetName)(options).plugins;
  
  throw new Error(`Cannot load preset "${fn}". Check your configuration for errors.`);
}

/**
 * Resolve cssnano plugins configuration
 * @param {Options} options
 * @returns {Array}
 */
function resolveConfig(options) {
  if (options.preset) return resolvePreset(options.preset);
  
  const searchPath = options.configFile ? undefined : process.cwd();
  const configPath = options.configFile ? path.resolve(process.cwd(), options.configFile) : undefined;
  
  const configExplorer = lilconfigSync(cssnano, {
    searchPlaces: [
      'package.json', '.cssnanorc', '.cssnanorc.json',
      '.cssnanorc.js', 'cssnano.config.js'
    ],
  });

  const config = configPath ? configExplorer.load(configPath) : configExplorer.search(searchPath);

  return config !== null ? resolvePreset(config.config.preset || config.config) : resolvePreset('default');
}

/**
 * Create a cssnano plugin for PostCSS
 * @param {Options} [options={}]
 * @returns {import('postcss').Processor}
 */
function cssnanoPlugin(options = {}) {
  if (Array.isArray(options.plugins)) {
    options.preset = options.preset || { plugins: [] };

    options.plugins.forEach(plugin => {
      const pluginArray = Array.isArray(plugin) ? plugin : [plugin, {}];
      const [pluginDef, pluginOpts] = pluginArray;
      const resolvedPlugin = typeof pluginDef === 'string' && isResolvable(pluginDef) ? require(pluginDef) : pluginDef;
      options.preset.plugins.push([resolvedPlugin, pluginOpts]);
    });
  }

  const plugins = [];
  const nanoPlugins = resolveConfig(options);

  for (const nanoPlugin of nanoPlugins) {
    if (Array.isArray(nanoPlugin)) {
      const [processor, opts] = nanoPlugin;
      if (opts === true || (typeof opts === 'object' && !opts.exclude)) {
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
