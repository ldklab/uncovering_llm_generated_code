"use strict";

const path = require('path');
const postcss = require('postcss');
const { cosmiconfig } = require('cosmiconfig');
const isResolvable = require('is-resolvable');

const cssnano = 'cssnano';

function initializePlugin(plugin, css, result) {
  if (Array.isArray(plugin)) {
    const [processor, opts] = plugin;

    if (typeof opts === 'undefined' || (typeof opts === 'object' && !opts.exclude) || (typeof opts === 'boolean' && opts)) {
      return Promise.resolve(processor(opts)(css, result));
    }
  } else if (typeof plugin === 'function') {
    return Promise.resolve(plugin()(css, result));
  }

  return Promise.resolve();
}

function resolvePreset(preset) {
  let fn, options;

  if (Array.isArray(preset)) {
    fn = preset[0];
    options = preset[1];
  } else {
    fn = preset;
    options = {};
  }

  if (preset.plugins) {
    return Promise.resolve(preset.plugins);
  }

  if (fn === 'default') {
    return Promise.resolve(require('cssnano-preset-default')(options).plugins);
  }

  if (typeof fn === 'function') {
    return Promise.resolve(fn(options).plugins);
  }

  if (isResolvable(fn)) {
    return Promise.resolve(require(fn)(options).plugins);
  }

  const sugar = `cssnano-preset-${fn}`;
  
  if (isResolvable(sugar)) {
    return Promise.resolve(require(sugar)(options).plugins);
  }

  throw new Error(`Cannot load preset "${fn}". Please check your configuration for errors and try again.`);
}

function resolveConfig(css, result, options) {
  if (options.preset) {
    return resolvePreset(options.preset);
  }

  const inputFile = css.source && css.source.input && css.source.input.file;
  let searchPath = inputFile ? path.dirname(inputFile) : process.cwd();
  let configPath = null;

  if (options.configFile) {
    searchPath = null;
    configPath = path.resolve(process.cwd(), options.configFile);
  }

  const configExplorer = cosmiconfig(cssnano);
  const searchForConfig = configPath ? configExplorer.load(configPath) : configExplorer.search(searchPath);
  
  return searchForConfig.then(config => {
    if (!config) {
      return resolvePreset('default');
    }

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

  return (css, result) => {
    return resolveConfig(css, result, options).then(plugins => {
      return plugins.reduce((promise, plugin) => {
        return promise.then(initializePlugin.bind(null, plugin, css, result));
      }, Promise.resolve());
    });
  };
});
