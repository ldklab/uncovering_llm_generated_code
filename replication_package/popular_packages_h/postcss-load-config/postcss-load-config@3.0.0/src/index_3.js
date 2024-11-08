'use strict';

const path = require('path');
const { cosmiconfig, cosmiconfigSync } = require('cosmiconfig');
const loadOptions = require('./options.js');
const loadPlugins = require('./plugins.js');

/**
 * Processes the configuration result from cosmiconfig.
 *
 * @param {Object} ctx - Configuration Context.
 * @param {Object} result - Result from cosmiconfig search.
 * @returns {Object} - Processed PostCSS configuration.
 */
function processResult(ctx, result) {
  const filePath = result.filepath || '';
  let config = result.config || {};

  config = typeof config === 'function' ? config(ctx) : { ...config, ...ctx };

  if (!config.plugins) {
    config.plugins = [];
  }

  return {
    plugins: loadPlugins(config, filePath),
    options: loadOptions(config, filePath),
    file: filePath
  };
}

/**
 * Builds the configuration context.
 *
 * @param {Object} ctx - User-provided context overrides.
 * @returns {Object} - Full configuration context.
 */
function createContext(ctx) {
  const defaultContext = {
    cwd: process.cwd(),
    env: process.env.NODE_ENV || 'development'
  };

  ctx = { ...defaultContext, ...ctx };

  if (!ctx.env) {
    process.env.NODE_ENV = 'development';
  }

  return ctx;
}

/**
 * Asynchronously loads the PostCSS configuration.
 *
 * @param {Object} ctx - Configuration context.
 * @param {String} [path] - Configuration file path.
 * @param {Object} [options] - Options for cosmiconfig.
 * @returns {Promise} - Promise resolving to PostCSS configuration.
 */
async function rc(ctx, path, options) {
  ctx = createContext(ctx);
  const resolvedPath = path ? path.resolve(path) : process.cwd();

  try {
    const result = await cosmiconfig('postcss', options).search(resolvedPath);
    if (!result) throw new Error(`No PostCSS Config found in: ${resolvedPath}`);
    return processResult(ctx, result);
  } catch (err) {
    throw err;
  }
}

rc.sync = (ctx, path, options) => {
  ctx = createContext(ctx);
  const resolvedPath = path ? path.resolve(path) : process.cwd();

  const result = cosmiconfigSync('postcss', options).search(resolvedPath);
  if (!result) throw new Error(`No PostCSS Config found in: ${resolvedPath}`);

  return processResult(ctx, result);
};

module.exports = rc;
