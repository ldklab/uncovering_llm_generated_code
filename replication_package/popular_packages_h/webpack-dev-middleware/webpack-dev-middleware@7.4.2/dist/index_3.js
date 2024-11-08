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

function wdm(compiler, options = {}) {
  validate(schema, options, {
    name: "Dev Middleware",
    baseDataPath: "options",
  });

  const { mimeTypes } = options;
  if (mimeTypes) {
    mime.types = { ...mime.types, ...mimeTypes };
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

  if (options.writeToDisk) {
    setupWriteToDisk(context);
  }
  setupOutputFileSystem(context);

  if (context.compiler.watching) {
    context.watching = context.compiler.watching;
  } else {
    const errorHandler = (error) => {
      if (error) {
        context.logger.error(error);
      }
    };

    if (Array.isArray(context.compiler.compilers)) {
      const watchOptions = context.compiler.compilers.map(
        (childCompiler) => childCompiler.options.watchOptions || {}
      );
      context.watching = compiler.watch(watchOptions, errorHandler);
    } else {
      const watchOptions = context.compiler.options.watchOptions || {};
      context.watching = compiler.watch(watchOptions, errorHandler);
    }
  }

  const filledContext = context;
  const instance = middleware(filledContext);

  instance.getFilenameFromUrl = (url, extra) =>
    getFilenameFromUrl(filledContext, url, extra);
  instance.waitUntilValid = (callback = noop) => {
    ready(filledContext, callback);
  };
  instance.invalidate = (callback = noop) => {
    ready(filledContext, callback);
    filledContext.watching.invalidate();
  };
  instance.close = (callback = noop) => {
    filledContext.watching.close(callback);
  };
  instance.context = filledContext;

  return instance;
}

function hapiWrapper() {
  return {
    pkg: { name: "webpack-dev-middleware" },
    multiple: true,
    register(server, options) {
      const { compiler, ...rest } = options;

      if (!compiler) {
        throw new Error("The compiler options is required.");
      }

      const devMiddleware = wdm(compiler, rest);

      if (!server.decorations.server.includes("webpackDevMiddleware")) {
        server.decorate("server", "webpackDevMiddleware", devMiddleware);
      }

      server.ext("onRequest", (request, h) => 
        new Promise((resolve, reject) => {
          let isFinished = false;
          request.raw.res.send = (data) => {
            isFinished = true;
            request.raw.res.end(data);
          };
          request.raw.res.finish = (data) => {
            isFinished = true;
            request.raw.res.end(data);
          };
          devMiddleware(request.raw.req, request.raw.res, (error) => {
            if (error) {
              reject(error);
              return;
            }
            if (!isFinished) {
              resolve(request);
            }
          });
        }).then(() => h.continue).catch((error) => {
          throw error;
        })
      );
    },
  };
}

function koaWrapper(compiler, options) {
  const devMiddleware = wdm(compiler, options);

  const wrapper = async function webpackDevMiddleware(ctx, next) {
    const { req, res } = ctx;
    res.locals = ctx.state;
    let { status } = ctx;

    res.getStatusCode = () => status;
    res.setStatusCode = (statusCode) => {
      status = statusCode;
      ctx.status = statusCode;
    };

    try {
      await new Promise((resolve, reject) => {
        res.stream = (stream) => {
          ctx.body = stream;
        };
        res.send = (data) => {
          ctx.body = data;
        };
        res.finish = (data) => {
          ctx.status = status;
          res.end(data);
        };
        devMiddleware(req, res, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = { message: err.message };
    }

    await next();
  };

  wrapper.devMiddleware = devMiddleware;
  return wrapper;
}

function honoWrapper(compiler, options) {
  const devMiddleware = wdm(compiler, options);

  const wrapper = async function webpackDevMiddleware(c, next) {
    const { req, res } = c;
    c.set("webpack", { devMiddleware: devMiddleware.context });

    req.getMethod = () => c.req.method;
    req.getHeader = (name) => c.req.header(name);
    req.getURL = () => c.req.url;

    let { status } = c.res;

    res.getStatusCode = () => status;
    res.setStatusCode = (code) => {
      status = code;
    };

    res.getHeader = (name) => c.res.headers.get(name);
    res.setHeader = (name, value) => {
      c.res.headers.append(name, value);
      return c.res;
    };
    res.removeHeader = (name) => {
      c.res.headers.delete(name);
    };
    res.getResponseHeaders = () => Array.from(c.res.headers.keys());
    res.getOutgoing = () => c.env.outgoing;

    let body;

    try {
      await new Promise((resolve, reject) => {
        res.stream = (stream) => {
          body = stream;
        };
        res.send = (data) => {
          body = data;
        };
        res.finish = (data) => {
          body = typeof data !== "undefined" ? data : null;
        };
        devMiddleware(req, res, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    } catch (err) {
      c.status(500);
      return c.json({ message: err.message });
    }

    if (typeof body !== "undefined") {
      return c.body(body, status);
    }

    await next();
  };

  wrapper.devMiddleware = devMiddleware;
  return wrapper;
}

wdm.hapiWrapper = hapiWrapper;
wdm.koaWrapper = koaWrapper;
wdm.honoWrapper = honoWrapper;

module.exports = wdm;
