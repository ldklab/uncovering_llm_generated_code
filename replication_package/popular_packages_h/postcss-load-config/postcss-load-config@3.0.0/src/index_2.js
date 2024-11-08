'use strict'

const { resolve } = require('path');
const { cosmiconfig, cosmiconfigSync } = require('cosmiconfig');
const loadOptions = require('./options.js');
const loadPlugins = require('./plugins.js');

const processResult = (ctx, result) => {
  const file = result.filepath || '';
  let config = typeof result.config === 'function' ? result.config(ctx) : Object.assign({}, result.config, ctx);

  if (!config.plugins) {
    config.plugins = [];
  }

  return {
    plugins: loadPlugins(config, file),
    options: loadOptions(config, file),
    file
  };
}

const createContext = (ctx) => {
  ctx = Object.assign({
    cwd: process.cwd(),
    env: process.env.NODE_ENV
  }, ctx);

  if (!ctx.env) {
    process.env.NODE_ENV = 'development';
  }

  return ctx;
}

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
}

rc.sync = (ctx, path, options) => {
  ctx = createContext(ctx);
  path = path ? resolve(path) : process.cwd();
  const result = cosmiconfigSync('postcss', options).search(path);

  if (!result) {
    throw new Error(`No PostCSS Config found in: ${path}`);
  }
  return processResult(ctx, result);
}

module.exports = rc;
