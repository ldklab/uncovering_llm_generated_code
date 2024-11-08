"use strict";

const { validate } = require("schema-utils");
const mime = require("mime-types");
const middleware = require("./middleware");
const getFilenameFromUrl = require("./utils/getFilenameFromUrl");
const setupHooks = require("./utils/setupHooks");
const setupWriteToDisk = require("./utils/setupWriteToDisk");
const setupOutputFileSystem = require("./utils/setupOutputFileSystem");
const ready = require("./utils/ready");
const schema = require("./options.json");

/**
 * @typedef {import("webpack").Compiler} Compiler
 * @typedef {import("webpack").MultiCompiler} MultiCompiler
 * @typedef {import("http").IncomingMessage} IncomingMessage
 * @typedef {import("http").ServerResponse & { locals?: any }} ServerResponse
 * @typedef {import("fs").ReadStream} ReadStream
 * @typedef {import("webpack").Stats} Stats
 * @typedef {import("webpack").MultiStats} MultiStats
 * @typedef {NonNullable<import("webpack").Configuration["watchOptions"]>} WatchOptions
 * @typedef {ReturnType<Compiler["watch"]>} Watching
 * @typedef {ReturnType<MultiCompiler["watch"]>} MultiWatching
 * @typedef {Object} Options
 * @property {{[key: string]: string}} [mimeTypes]
 * @property {boolean | ((targetPath: string) => boolean)} [writeToDisk]
 * @property {string[]} [methods]
 * @property {boolean} [serverSideRender]
 * @property {boolean | string} [index]
 * @property {OutputFileSystem} [outputFileSystem]
 * @property {string} [etag]
 * @property {boolean} [lastModified]
 * @property {boolean | number | string | { maxAge?: number, immutable?: boolean }} [cacheControl]
 * @property {"weak" | "strong"} [etag]
 * 
 * @callback Callback
 * @param {Stats | MultiStats} [stats]
 */

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @param {Compiler | MultiCompiler} compiler
 * @param {Options<RequestInternal, ResponseInternal>} [options]
 * @returns {API<RequestInternal, ResponseInternal>}
 */
function webpackDevMiddleware(compiler, options = {}) {
  validate(schema, options, { name: "Dev Middleware", baseDataPath: "options" });

  if (options.mimeTypes) {
    mime.types = { ...mime.types, ...options.mimeTypes };
  }

  const context = {
    state: false,
    stats: undefined,
    callbacks: [],
    options,
    compiler,
    logger: compiler.getInfrastructureLogger("webpack-dev-middleware"),
  };

  setupHooks(context);
  if (options.writeToDisk) setupWriteToDisk(context);
  setupOutputFileSystem(context);

  if (context.compiler.watching) {
    context.watching = context.compiler.watching;
  } else {
    const errorHandler = (error) => {
      if (error) context.logger.error(error);
    };

    if (Array.isArray(context.compiler.compilers)) {
      const watchOptions = context.compiler.compilers.map(childCompiler => childCompiler.options.watchOptions || {});
      context.watching = compiler.watch(watchOptions, errorHandler);
    } else {
      context.watching = compiler.watch(context.compiler.options.watchOptions || {}, errorHandler);
    }
  }

  const instance = middleware(context);
  instance.getFilenameFromUrl = (url, extra) => getFilenameFromUrl(context, url, extra);
  instance.waitUntilValid = (callback) => ready(context, callback);
  instance.invalidate = (callback) => {
    ready(context, callback);
    context.watching.invalidate();
  };
  instance.close = (callback) => context.watching.close(callback);
  instance.context = context;
  return instance;
}

module.exports = webpackDevMiddleware;
