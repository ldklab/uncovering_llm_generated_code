/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
const fs = require("fs");
const readFile = fs.readFile.bind(fs);
const loadLoader = require("./loadLoader");

function utf8BufferToString(buffer) {
  const str = buffer.toString("utf-8");
  return str.charCodeAt(0) === 0xFEFF ? str.slice(1) : str;
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
  const slashIndex = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  const firstSlashIndex = Math.min(path.indexOf("/"), path.indexOf("\\"));
  return slashIndex < 0 ? path : path.slice(0, slashIndex + (slashIndex === firstSlashIndex ? 1 : 0));
}

function createLoaderObject(loader) {
  const loaderObject = {
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
  Object.defineProperty(loaderObject, "request", {
    enumerable: true,
    get() {
      return loaderObject.path.replace(/#/g, "\0#") + loaderObject.query.replace(/#/g, "\0#") + loaderObject.fragment;
    },
    set(value) {
      if (typeof value === "string") {
        const parsed = parsePathQueryFragment(value);
        loaderObject.path = parsed.path;
        loaderObject.query = parsed.query;
        loaderObject.fragment = parsed.fragment;
        loaderObject.options = undefined;
        loaderObject.ident = undefined;
      } else {
        if (!value.loader) throw new Error("request should be a string or object with loader and options (" + JSON.stringify(value) + ")");
        loaderObject.path = value.loader;
        loaderObject.fragment = value.fragment || "";
        loaderObject.options = value.options;
        loaderObject.ident = value.ident;
        loaderObject.query = buildQuery(loaderObject.options, loaderObject.ident);
      }
    }
  });

  function buildQuery(options, ident) {
    if (options === null || options === undefined) return "";
    if (typeof options === "string") return `?${options}`;
    if (ident) return `??${ident}`;
    if (typeof options === "object" && options.ident) return `??${options.ident}`;
    return `?${JSON.stringify(options)}`;
  }

  loaderObject.request = loader;
  if (Object.preventExtensions) Object.preventExtensions(loaderObject);
  return loaderObject;
}

function runSyncOrAsync(fn, context, args, callback) {
  let isSync = true;
  let isDone = false;
  let isError = false;
  let reportedError = false;
  
  context.async = () => {
    if (isDone) {
      if (!reportedError) throw new Error("async(): The callback was already called.");
      return;
    }
    isSync = false;
    return innerCallback;
  };
  
  const innerCallback = context.callback = (...callbackArgs) => {
    if (isDone) {
      if (!reportedError) throw new Error("callback(): The callback was already called.");
      return;
    }
    isDone = true;
    isSync = false;
    try {
      callback(...callbackArgs);
    } catch (e) {
      isError = true;
      throw e;
    }
  };

  try {
    const result = (function LOADER_EXECUTION() { return fn.apply(context, args); })();
    if (isSync) {
      handleSyncResult(result);
    }
  } catch (e) {
    handleError(e);
  }

  function handleSyncResult(result) {
    isDone = true;
    if (result === undefined) return callback();
    if (result && typeof result === "object" && typeof result.then === "function") {
      return result.then(r => callback(null, r), callback);
    }
    callback(null, result);
  }

  function handleError(e) {
    if (isError) throw e;
    if (isDone) {
      if (typeof e === "object" && e.stack) console.error(e.stack);
      else console.error(e);
      return;
    }
    isDone = true;
    reportedError = true;
    callback(e);
  }
}

function convertArgs(args, raw) {
  if (!raw && Buffer.isBuffer(args[0])) {
    args[0] = utf8BufferToString(args[0]);
  } else if (raw && typeof args[0] === "string") {
    args[0] = Buffer.from(args[0], "utf-8");
  }
}

function iteratePitchingLoaders(options, loaderContext, callback) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(options, loaderContext, callback);
  }

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  loadLoader(currentLoaderObject, (err) => {
    if (err) {
      loaderContext.cacheable(false);
      return callback(err);
    }
    
    const pitchFn = currentLoaderObject.pitch;
    currentLoaderObject.pitchExecuted = true;
    if (!pitchFn) return iteratePitchingLoaders(options, loaderContext, callback);

    runSyncOrAsync(
      pitchFn,
      loaderContext, 
      [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}],
      (err, ...pitchArgs) => {
        if (err) return callback(err);

        const shouldContinue = pitchArgs.some(arg => arg !== undefined);
        if (shouldContinue) {
          loaderContext.loaderIndex--;
          iterateNormalLoaders(options, loaderContext, pitchArgs, callback);
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

function iterateNormalLoaders(options, loaderContext, currentArgs, callback) {
  if (loaderContext.loaderIndex < 0) {
    return callback(null, currentArgs);
  }

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(options, loaderContext, currentArgs, callback);
  }

  const normalFn = currentLoaderObject.normal;
  currentLoaderObject.normalExecuted = true;
  if (!normalFn) {
    return iterateNormalLoaders(options, loaderContext, currentArgs, callback);
  }

  convertArgs(currentArgs, currentLoaderObject.raw);

  runSyncOrAsync(normalFn, loaderContext, currentArgs, (err, ...normalArgs) => {
    if (err) {
      return callback(err);
    }
    iterateNormalLoaders(options, loaderContext, normalArgs, callback);
  });
}

exports.getContext = function getContext(resource) {
  const path = parsePathQueryFragment(resource).path;
  return dirname(path);
};

exports.runLoaders = function runLoaders(options, callback) {
  const { resource = "", loaders = [], context = {}, readResource = readFile } = options;

  const { path: resourcePath, query: resourceQuery, fragment: resourceFragment } = resource ? parsePathQueryFragment(resource) : {};
  const contextDirectory = resourcePath ? dirname(resourcePath) : null;

  let requestCacheable = true;
  const fileDependencies = [];
  const contextDependencies = [];
  const missingDependencies = [];

  const loaderObjects = loaders.map(createLoaderObject);

  const loaderContext = {
    context: contextDirectory,
    loaderIndex: 0,
    loaders: loaderObjects,
    resourcePath,
    resourceQuery,
    resourceFragment,
    async: null,
    callback: null,
    cacheable(flag) {
      if (flag === false) {
        requestCacheable = false;
      }
    },
    dependency: loaderContext.addDependency = file => fileDependencies.push(file),
    addContextDependency: context => contextDependencies.push(context),
    addMissingDependency: context => missingDependencies.push(context),
    getDependencies: () => fileDependencies.slice(),
    getContextDependencies: () => contextDependencies.slice(),
    getMissingDependencies: () => missingDependencies.slice(),
    clearDependencies() {
      fileDependencies.length = 0;
      contextDependencies.length = 0;
      missingDependencies.length = 0;
      requestCacheable = true;
    }
  };

  Object.defineProperties(loaderContext, {
    resource: {
      enumerable: true,
      get() {
        if (loaderContext.resourcePath === undefined) return undefined;
        return loaderContext.resourcePath.replace(/#/g, "\0#") + loaderContext.resourceQuery.replace(/#/g, "\0#") + loaderContext.resourceFragment;
      },
      set(value) {
        const parsedResource = value ? parsePathQueryFragment(value) : {};
        loaderContext.resourcePath = parsedResource.path;
        loaderContext.resourceQuery = parsedResource.query;
        loaderContext.resourceFragment = parsedResource.fragment;
      }
    },
    request: {
      enumerable: true,
      get() {
        return loaderContext.loaders.map(loader => loader.request).concat(loaderContext.resource || "").join("!");
      }
    },
    remainingRequest: {
      enumerable: true,
      get() {
        if (loaderContext.loaderIndex >= loaderContext.loaders.length - 1 && !loaderContext.resource) return "";
        return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(loader => loader.request).concat(loaderContext.resource || "").join("!");
      }
    },
    currentRequest: {
      enumerable: true,
      get() {
        return loaderContext.loaders.slice(loaderContext.loaderIndex).map(loader => loader.request).concat(loaderContext.resource || "").join("!");
      }
    },
    previousRequest: {
      enumerable: true,
      get() {
        return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(loader => loader.request).join("!");
      }
    },
    query: {
      enumerable: true,
      get() {
        const loader = loaderContext.loaders[loaderContext.loaderIndex];
        return loader.options && typeof loader.options === "object" ? loader.options : loader.query;
      }
    },
    data: {
      enumerable: true,
      get() {
        return loaderContext.loaders[loaderContext.loaderIndex].data;
      }
    }
  });

  if (Object.preventExtensions) Object.preventExtensions(loaderContext);

  const processOptions = {
    resourceBuffer: null,
    readResource
  };

  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    if (err) {
      return callback(err, {
        cacheable: requestCacheable,
        fileDependencies,
        contextDependencies,
        missingDependencies
      });
    }
    callback(null, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
      cacheable: requestCacheable,
      fileDependencies,
      contextDependencies,
      missingDependencies
    });
  });
};
