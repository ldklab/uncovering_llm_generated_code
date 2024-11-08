"use strict";

const path = require("path");
const postcss = require("postcss");
const { cosmiconfig } = require("cosmiconfig");
const isResolvable = require("is-resolvable");

const cssnano = 'cssnano';

function initializePlugin(plugin, css, result) {
  if (Array.isArray(plugin)) {
    const [processor, options] = plugin;
    const opts = options || {};

    if ((typeof opts === 'object' && !opts.exclude) || opts === true) {
      return Promise.resolve(processor(opts)(css, result));
    }
  } else {
    return Promise.resolve(plugin()(css, result));
  }

  return Promise.resolve();
}

function resolvePreset(preset) {
  let func, options = {};

  if (Array.isArray(preset)) {
    [func, options] = preset;
  } else {
    func = preset;
  }

  if (preset.plugins) {
    return Promise.resolve(preset.plugins);
  }

  if (func === 'default') {
    return Promise.resolve(require("cssnano-preset-default")(options).plugins);
  }

  if (typeof func === 'function') {
    return Promise.resolve(func(options).plugins);
  }

  if (isResolvable(func)) {
    return Promise.resolve(require(func)(options).plugins);
  }

  const sugar = `cssnano-preset-${func}`;
  if (isResolvable(sugar)) {
    return Promise.resolve(require(sugar)(options).plugins);
  }

  throw new Error(`Cannot load preset "${func}". Please check your configuration for errors and try again.`);
}

function resolveConfig(css, result, options) {
  if (options.preset) return resolvePreset(options.preset);
  
  const inputFile = css.source && css.source.input && css.source.input.file;
  const searchPath = inputFile ? path.dirname(inputFile) : process.cwd();
  const configPath = options.configFile ? path.resolve(process.cwd(), options.configFile) : null;

  const configExplorer = cosmiconfig(cssnano);
  const configSearch = configPath ? configExplorer.load(configPath) : configExplorer.search(searchPath);

  return configSearch.then(config => {
    if (!config) return resolvePreset('default');
    return resolvePreset(config.config.preset || config.config);
  });
}

module.exports = postcss.plugin(cssnano, (options = {}) => {
  if (Array.isArray(options.plugins)) {
    if (!options.preset || !options.preset.plugins) {
      options.preset = { plugins: [] };
    }

    options.plugins.forEach(plugin => {
      if (Array.isArray(plugin)) {
        const [pluginDef, opts = {}] = plugin;
        const pluginImport = typeof pluginDef === 'string' && isResolvable(pluginDef) ? require(pluginDef) : pluginDef;
        options.preset.plugins.push([pluginImport, opts]);
      } else {
        const pluginImport = typeof plugin === 'string' && isResolvable(plugin) ? require(plugin) : plugin;
        options.preset.plugins.push([pluginImport, {}]);
      }
    });
  }

  return (css, result) => {
    return resolveConfig(css, result, options).then(plugins => {
      return plugins.reduce((promise, plugin) =>
        promise.then(() => initializePlugin(plugin, css, result)), Promise.resolve());
    });
  };
});
