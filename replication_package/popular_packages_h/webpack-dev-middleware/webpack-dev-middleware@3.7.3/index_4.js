'use strict';

const mime = require('mime');

const createContext = require('./lib/context');
const middleware = require('./lib/middleware');
const reporter = require('./lib/reporter');
const { setFs, toDisk } = require('./lib/fs');
const { getFilenameFromUrl, noop, ready } = require('./lib/util');

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

function wdm(compiler, opts) {
  const options = { ...defaults, ...opts };

  if (options.mimeTypes) {
    const { typeMap = options.mimeTypes, force = false } = options.mimeTypes;
    mime.define(typeMap, force);
  }

  const context = createContext(compiler, options);

  if (!options.lazy) {
    context.watching = compiler.watch(options.watchOptions, (err) => {
      if (err) {
        context.log.error(err.stack || err);
        if (err.details) {
          context.log.error(err.details);
        }
      }
    });
  } else {
    if (typeof options.filename === 'string') {
      const escapedFilename = options.filename.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
        .replace(/\\\[[a-z]+\\\]/gi, '.+');
      options.filename = new RegExp(`^/?${escapedFilename}$`);
    }

    context.state = true;
  }

  if (options.writeToDisk) {
    toDisk(context);
  }

  setFs(context, compiler);

  return {
    ...middleware(context),
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
  };
}

module.exports = wdm;
