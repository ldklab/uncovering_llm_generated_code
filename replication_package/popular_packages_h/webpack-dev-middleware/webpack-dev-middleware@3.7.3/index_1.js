'use strict';

const mime = require('mime');
const createContext = require('./lib/context');
const middleware = require('./lib/middleware');
const reporter = require('./lib/reporter');
const { setFs, toDisk } = require('./lib/fs');
const { getFilenameFromUrl, noop, ready } = require('./lib/util');

// Default configuration options
const defaults = {
  logLevel: 'info',
  logTime: false,
  logger: null,
  mimeTypes: null,
  reporter,
  stats: {
    colors: true,
    context: process.cwd(),
  },
  watchOptions: {
    aggregateTimeout: 200,
  },
  writeToDisk: false,
};

module.exports = function setupWebpackMiddleware(compiler, options) {
  // Merge user options with defaults
  const config = Object.assign({}, defaults, options);

  // Set custom MIME types if provided
  if (config.mimeTypes) {
    const typeMap = config.mimeTypes.typeMap || config.mimeTypes;
    mime.define(typeMap, !!config.mimeTypes.force);
  }

  // Create middleware context
  const context = createContext(compiler, config);

  // Handle watch mode
  if (!config.lazy) {
    // Start watch mode
    context.watching = compiler.watch(config.watchOptions, (error) => {
      if (error) {
        context.log.error(error.stack || error);
        if (error.details) {
          context.log.error(error.details);
        }
      }
    });
  } else {
    // Set up lazy options
    if (typeof config.filename === 'string') {
      const safeFilename = config.filename
        .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
        .replace(/\\\[[a-z]+\\\]/gi, '.+');
      config.filename = new RegExp(`^[/]{0,1}${safeFilename}$`);
    }
    context.state = true;
  }

  // Optionally write compiled files to disk
  if (config.writeToDisk) {
    toDisk(context);
  }

  // Set webpack's filesystem
  setFs(context, compiler);

  return Object.assign(middleware(context), {
    close(callback = noop) {
      if (context.watching) {
        context.watching.close(callback);
      } else {
        callback();
      }
    },

    context,

    fileSystem: context.fs,

    getFilenameFromUrl: getFilenameFromUrl.bind(this, context.options.publicPath, context.compiler),

    invalidate(callback = noop) {
      if (context.watching) {
        ready(context, callback, {});
        context.watching.invalidate();
      } else {
        callback();
      }
    },

    waitUntilValid(callback = noop) {
      ready(context, callback, {});
    },
  });
};
