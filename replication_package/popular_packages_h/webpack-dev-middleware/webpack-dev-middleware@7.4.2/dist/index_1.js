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
const noop = () => {};

/**
 * Main function for initializing Webpack Dev Middleware.
 * @param {Compiler | MultiCompiler} compiler - The Webpack compiler instance.
 * @param {Options} [options] - Configuration options.
 * @returns {API} - Middleware API with additional methods.
 */
function wdm(compiler, options = {}) {
  validate(schema, options, { name: "Dev Middleware", baseDataPath: "options" });

  // Setup MIME types
  const { mimeTypes } = options;
  if (mimeTypes) {
    Object.assign(mime.types, mimeTypes);
  }

  // Initialize context
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

  // Start watching
  if (compiler.watching) {
    context.watching = compiler.watching;
  } else {
    const errorHandler = (error) => {
      if (error) context.logger.error(error);
    };

    if (Array.isArray(compiler.compilers)) {
      context.watching = compiler.watch(compiler.compilers.map(({ options }) => options.watchOptions || {}), errorHandler);
    } else {
      context.watching = compiler.watch(compiler.options.watchOptions || {}, errorHandler);
    }
  }

  const filledContext = context;
  const instance = middleware(filledContext);

  // API methods
  instance.getFilenameFromUrl = (url, extra) => getFilenameFromUrl(filledContext, url, extra);
  instance.waitUntilValid = (callback = noop) => ready(filledContext, callback);
  instance.invalidate = (callback = noop) => {
    ready(filledContext, callback);
    filledContext.watching.invalidate();
  };
  instance.close = (callback = noop) => filledContext.watching.close(callback);

  instance.context = filledContext;
  return instance;
}

// Integration for Hapi.js
function hapiWrapper() {
  return {
    pkg: { name: "webpack-dev-middleware" },
    multiple: true,
    register(server, options) {
      const { compiler, ...rest } = options;
      if (!compiler) throw new Error("The compiler options is required.");

      const devMiddleware = wdm(compiler, rest);
      if (!server.decorations.server.includes("webpackDevMiddleware")) {
        server.decorate("server", "webpackDevMiddleware", devMiddleware);
      }

      server.ext("onRequest", async (request, h) => {
        await new Promise((resolve, reject) => {
          request.raw.res.send = (data) => request.raw.res.end(data);
          request.raw.res.finish = (data) => request.raw.res.end(data);

          devMiddleware(request.raw.req, request.raw.res, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve(request);
            }
          });
        });
        return h.continue;
      });
    }
  };
}

// Integration for Koa.js
function koaWrapper(compiler, options) {
  const devMiddleware = wdm(compiler, options);

  return async function (ctx, next) {
    const { req, res } = ctx;
    res.locals = ctx.state;
    res.getStatusCode = () => ctx.status;
    res.setStatusCode = (code) => (ctx.status = code);
  
    await new Promise((resolve, reject) => {
      res.stream = (stream) => (ctx.body = stream);
      res.send = (data) => (ctx.body = data);
      res.finish = (data) => {
        ctx.status = res.getStatusCode();
        res.end(data);
      };
      devMiddleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).catch((err) => {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = { message: err.message };
    });

    await next();
  };
}

// Integration for Hono
function honoWrapper(compiler, options) {
  const devMiddleware = wdm(compiler, options);

  return async function (c, next) {
    const { req, res } = c;
    c.set("webpack", { devMiddleware: devMiddleware.context });
    req.getMethod = () => c.req.method;
    req.getHeader = (name) => c.req.header(name);

    let body;
    
    await new Promise((resolve, reject) => {
      res.stream = (stream) => (body = stream);
      res.send = (data) => (body = data);
      res.finish = (data) => (body = data != undefined ? data : null);

      devMiddleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).catch((err) => {
      c.status(500);
      c.json({ message: err.message });
    });

    if (body) {
      c.body(body, res.getStatusCode());
    }

    await next();
  };
}

wdm.hapiWrapper = hapiWrapper;
wdm.koaWrapper = koaWrapper;
wdm.honoWrapper = honoWrapper;

module.exports = wdm;
