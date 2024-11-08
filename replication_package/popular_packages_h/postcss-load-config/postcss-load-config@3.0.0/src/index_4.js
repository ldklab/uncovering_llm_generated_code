'use strict';

const resolve = require('path').resolve;
const cosmiconfig = require('cosmiconfig');
const loadOptions = require('./options.js');
const loadPlugins = require('./plugins.js');

/**
 * Process the configuration result obtained from cosmiconfig.
 * 
 * @param  {Object} ctx - Configuration context.
 * @param  {Object} result - Result object from cosmiconfig.
 * @return {Object} Processed PostCSS configuration.
 */
const processResult = (ctx, result) => {
  const file = result.filepath || '';
  let config = result.config || {};

  if (typeof config === 'function') {
    config = config(ctx);
  } else {
    config = { ...config, ...ctx };
  }

  config.plugins = config.plugins || [];

  return {
    plugins: loadPlugins(config, file),
    options: loadOptions(config, file),
    file: file
  };
};

/**
 * Create and return a full configuration context.
 * 
 * @param  {Object} ctx - Initial configuration context.
 * @return {Object} Full configuration context with defaults.
 */
const createContext = (ctx) => {
  ctx = {
    cwd: process.cwd(),
    env: process.env.NODE_ENV,
    ...ctx
  };

  if (!ctx.env) {
    process.env.NODE_ENV = 'development';
  }

  return ctx;
};

/**
 * Asynchronously load the PostCSS configuration.
 * 
 * @param  {Object} ctx - Configuration context.
 * @param  {String} path - Configuration file path.
 * @param  {Object} options - Configuration options for cosmiconfig.
 * @return {Promise} Promise resolving to the PostCSS configuration.
 */
const rc = (ctx, path, options) => {
  ctx = createContext(ctx);
  path = path ? resolve(path) : process.cwd();

  return cosmiconfig('postcss', options)
    .search(path)
    .then((result) => {
      if (!result) {
        throw new Error(`No PostCSS Config found in: ${path}`);
      }

      return processResult(ctx, result);
    });
};

/**
 * Synchronously load the PostCSS configuration.
 * 
 * @param  {Object} ctx - Configuration context.
 * @param  {String} path - Configuration file path.
 * @param  {Object} options - Configuration options for cosmiconfig.
 * @return {Object} The processed PostCSS configuration.
 */
rc.sync = (ctx, path, options) => {
  ctx = createContext(ctx);
  path = path ? resolve(path) : process.cwd();

  const result = cosmiconfig.sync('postcss', options).search(path);

  if (!result) {
    throw new Error(`No PostCSS Config found in: ${path}`);
  }

  return processResult(ctx, result);
};

module.exports = rc;
