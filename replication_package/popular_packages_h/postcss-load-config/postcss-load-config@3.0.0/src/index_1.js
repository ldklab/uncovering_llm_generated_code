'use strict';

const path = require('path');
const cosmiconfig = require('cosmiconfig');
const loadOptions = require('./options.js');
const loadPlugins = require('./plugins.js');

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
    file
  };
};

const createContext = (ctx) => {
  const defaultContext = {
    cwd: process.cwd(),
    env: process.env.NODE_ENV
  };

  ctx = { ...defaultContext, ...ctx };

  if (!ctx.env) {
    process.env.NODE_ENV = 'development';
  }

  return ctx;
};

const rc = (ctx, path, options) => {
  ctx = createContext(ctx);
  path = path ? path.resolve(path) : process.cwd();

  return cosmiconfig('postcss', options)
    .search(path)
    .then(result => {
      if (!result) {
        throw new Error(`No PostCSS Config found in: ${path}`);
      }

      return processResult(ctx, result);
    });
};

rc.sync = (ctx, path, options) => {
  ctx = createContext(ctx);
  path = path ? path.resolve(path) : process.cwd();

  const result = cosmiconfig('postcss', options).searchSync(path);

  if (!result) {
    throw new Error(`No PostCSS Config found in: ${path}`);
  }

  return processResult(ctx, result);
};

module.exports = rc;
