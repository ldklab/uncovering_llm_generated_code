const fs = require("fs");
const readFile = fs.readFile.bind(fs);
const loadLoader = require("./loadLoader");

function utf8BufferToString(buffer) {
  const str = buffer.toString("utf-8");
  return str.charCodeAt(0) === 0xFEFF ? str.substring(1) : str;
}

const PATH_QUERY_FRAGMENT_REGEXP = /^((?:\0.|[^?#\0])*)(\?(?:\0.|[^#\0])*)?(#.*)?$/;

function parsePathQueryFragment(str) {
  const match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
  return {
    path: match[1].replace(/\0(.)/g, "$1"),
    query: match[2] ? match[2].replace(/\0(.)/g, "$1") : "",
    fragment: match[3] || ""
  };
}

function dirname(path) {
  if (path === "/") return "/";
  const i = path.lastIndexOf("/");
  const j = path.lastIndexOf("\\");
  const idx = Math.max(i, j);
  if (idx < 0) return path;
  return path.substring(0, idx + (idx === Math.min(path.indexOf("/"), path.indexOf("\\")) ? 1 : 0));
}

function createLoaderObject(loader) {
  const obj = {
    path: null,
    query: null,
    fragment: null,
    options: null,
    ident: null,
    normal: null,
    pitch: null,
    raw: null,
    data: null,
    pitchExecuted: false,
    normalExecuted: false
  };
  Object.defineProperty(obj, "request", {
    enumerable: true,
    get() {
      return obj.path.replace(/#/g, "\0#") + obj.query.replace(/#/g, "\0#") + obj.fragment;
    },
    set(value) {
      if (typeof value === "string") {
        const parsed = parsePathQueryFragment(value);
        obj.path = parsed.path;
        obj.query = parsed.query;
        obj.fragment = parsed.fragment;
        obj.options = undefined;
        obj.ident = undefined;
      } else {
        if (!value.loader) throw new Error("request should be a string or object with loader and options");
        obj.path = value.loader;
        obj.fragment = value.fragment || "";
        obj.options = value.options;
        obj.ident = value.ident;
        obj.query = obj.options === null ? "" :
          typeof obj.options === "string" ? "?" + obj.options :
          obj.ident ? "??" + obj.ident :
          typeof obj.options === "object" && obj.options.ident ? "??" + obj.options.ident :
          "?" + JSON.stringify(obj.options);
      }
    }
  });
  obj.request = loader;
  if (Object.preventExtensions) {
    Object.preventExtensions(obj);
  }
  return obj;
}

function runSyncOrAsync(fn, context, args, callback) {
  let isSync = true;
  let isDone = false;
  let isError = false; // internal error
  let reportedError = false;
  context.async = function async() {
    if (isDone) {
      if (reportedError) return; // ignore
      throw new Error("async(): The callback was already called.");
    }
    isSync = false;
    return innerCallback;
  };
  const innerCallback = context.callback = function callbackFn() {
    if (isDone) {
      if (reportedError) return; // ignore
      throw new Error("callback(): The callback was already called.");
    }
    isDone = true;
    isSync = false;
    try {
      callback.apply(null, arguments);
    } catch (error) {
      isError = true;
      throw error;
    }
  };
  try {
    const result = (function LOADER_EXECUTION() {
      return fn.apply(context, args);
    })();
    if (isSync) {
      isDone = true;
      if (result === undefined)
        return callback();
      if (result && typeof result === "object" && typeof result.then === "function") {
        return result.then(r => {
          callback(null, r);
        }, callback);
      }
      return callback(null, result);
    }
  } catch (error) {
    if (isError) throw error;
    if (isDone) {
      if (typeof error === "object" && error.stack) console.error(error.stack);
      else console.error(error);
      return;
    }
    isDone = true;
    reportedError = true;
    callback(error);
  }
}

function convertArgs(args, raw) {
  if (!raw && Buffer.isBuffer(args[0])) args[0] = utf8BufferToString(args[0]);
  else if (raw && typeof args[0] === "string") args[0] = Buffer.from(args[0], "utf-8");
}

function iteratePitchingLoaders(options, loaderContext, callback) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length)
    return processResource(options, loaderContext, callback);

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  loadLoader(currentLoaderObject, err => {
    if (err) {
      loaderContext.cacheable(false);
      return callback(err);
    }
    const fn = currentLoaderObject.pitch;
    currentLoaderObject.pitchExecuted = true;
    if (!fn) return iteratePitchingLoaders(options, loaderContext, callback);

    runSyncOrAsync(
      fn,
      loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}],
      (err, ...args) => {
        if (err) return callback(err);
        const hasArg = args.some(value => value !== undefined);
        if (hasArg) {
          loaderContext.loaderIndex--;
          iterateNormalLoaders(options, loaderContext, args, callback);
        } else {
          iteratePitchingLoaders(options, loaderContext, callback);
        }
      }
    );
  });
}

function processResource(options, loaderContext, callback) {
  loaderContext.loaderIndex = loaderContext.loaders.length - 1;

  const resourcePath = loaderContext.resourcePath;
  if (resourcePath) {
    loaderContext.addDependency(resourcePath);
    options.readResource(resourcePath, (err, buffer) => {
      if (err) return callback(err);
      options.resourceBuffer = buffer;
      iterateNormalLoaders(options, loaderContext, [buffer], callback);
    });
  } else {
    iterateNormalLoaders(options, loaderContext, [null], callback);
  }
}

function iterateNormalLoaders(options, loaderContext, args, callback) {
  if (loaderContext.loaderIndex < 0)
    return callback(null, args);

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  const fn = currentLoaderObject.normal;
  currentLoaderObject.normalExecuted = true;
  if (!fn) {
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  convertArgs(args, currentLoaderObject.raw);

  runSyncOrAsync(fn, loaderContext, args, (err, ...newArgs) => {
    if (err) return callback(err);
    iterateNormalLoaders(options, loaderContext, newArgs, callback);
  });
}

exports.getContext = function getContext(resource) {
  const path = parsePathQueryFragment(resource).path;
  return dirname(path);
};

exports.runLoaders = function runLoaders(options, callback) {
  const resource = options.resource || "";
  const loaders = options.loaders || [];
  const loaderContext = options.context || {};
  const readResource = options.readResource || readFile;

  const splittedResource = resource && parsePathQueryFragment(resource);
  const resourcePath = splittedResource ? splittedResource.path : undefined;
  const resourceQuery = splittedResource ? splittedResource.query : undefined;
  const resourceFragment = splittedResource ? splittedResource.fragment : undefined;
  const contextDirectory = resourcePath ? dirname(resourcePath) : null;

  let requestCacheable = true;
  const fileDependencies = [];
  const contextDependencies = [];
  const missingDependencies = [];

  const loaderObjs = loaders.map(createLoaderObject);

  Object.assign(loaderContext, {
    context: contextDirectory,
    loaderIndex: 0,
    loaders: loaderObjs,
    resourcePath,
    resourceQuery,
    resourceFragment,
    async: null,
    callback: null,
    cacheable(flag) {
      if (flag === false) requestCacheable = false;
    },
    addDependency(file) {
      fileDependencies.push(file);
    },
    addContextDependency(context) {
      contextDependencies.push(context);
    },
    addMissingDependency(context) {
      missingDependencies.push(context);
    },
    getDependencies() {
      return fileDependencies.slice();
    },
    getContextDependencies() {
      return contextDependencies.slice();
    },
    getMissingDependencies() {
      return missingDependencies.slice();
    },
    clearDependencies() {
      fileDependencies.length = 0;
      contextDependencies.length = 0;
      missingDependencies.length = 0;
      requestCacheable = true;
    }
  });

  Object.defineProperty(loaderContext, "resource", {
    enumerable: true,
    get() {
      if (loaderContext.resourcePath === undefined) return undefined;
      return loaderContext.resourcePath.replace(/#/g, "\0#") + loaderContext.resourceQuery.replace(/#/g, "\0#") + loaderContext.resourceFragment;
    },
    set(value) {
      const parsed = value && parsePathQueryFragment(value);
      loaderContext.resourcePath = parsed ? parsed.path : undefined;
      loaderContext.resourceQuery = parsed ? parsed.query : undefined;
      loaderContext.resourceFragment = parsed ? parsed.fragment : undefined;
    }
  });

  const requestGetters = {
    get request() {
      return loaderContext.loaders.map(o => o.request).concat(loaderContext.resource || "").join("!");
    },
    get remainingRequest() {
      if (loaderContext.loaderIndex >= loaderContext.loaders.length - 1 && !loaderContext.resource) return "";
      return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(o => o.request).concat(loaderContext.resource || "").join("!");
    },
    get currentRequest() {
      return loaderContext.loaders.slice(loaderContext.loaderIndex).map(o => o.request).concat(loaderContext.resource || "").join("!");
    },
    get previousRequest() {
      return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(o => o.request).join("!");
    },
    get query() {
      const entry = loaderContext.loaders[loaderContext.loaderIndex];
      return entry.options && typeof entry.options === "object" ? entry.options : entry.query;
    },
    get data() {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    }
  };

  Object.defineProperties(loaderContext, requestGetters);

  if (Object.preventExtensions) {
    Object.preventExtensions(loaderContext);
  }

  const processOptions = {
    resourceBuffer: null,
    readResource
  };

  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    callback(err, err ? {
      cacheable: requestCacheable,
      fileDependencies,
      contextDependencies,
      missingDependencies
    } : {
      result,
      resourceBuffer: processOptions.resourceBuffer,
      cacheable: requestCacheable,
      fileDependencies,
      contextDependencies,
      missingDependencies
    });
  });
};
