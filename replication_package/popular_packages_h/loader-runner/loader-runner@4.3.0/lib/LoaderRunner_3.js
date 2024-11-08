const fs = require("fs");
const readFile = fs.readFile.bind(fs);
const loadLoader = require("./loadLoader");

function utf8BufferToString(buf) {
  const str = buf.toString("utf-8");
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
  const idx = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  if (idx < 0) return path;
  return path.slice(0, idx + (idx === 0 ? 1 : 0));
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
    normalExecuted: false,
    get request() {
      return `${this.path.replace(/#/g, "\0#")}${this.query.replace(/#/g, "\0#")}${this.fragment}`;
    },
    set request(value) {
      if (typeof value === "string") {
        const parsed = parsePathQueryFragment(value);
        this.path = parsed.path;
        this.query = parsed.query;
        this.fragment = parsed.fragment;
        this.options = undefined;
        this.ident = undefined;
      } else if (value.loader) {
        this.path = value.loader;
        this.fragment = value.fragment || "";
        this.options = value.options;
        this.ident = value.ident;
        const optionsType = typeof this.options;
        if (optionsType === "object" && this.options.ident) {
          this.query = `??${this.options.ident}`;
        } else if (optionsType === "string") {
          this.query = `?${this.options}`;
        } else {
          this.query = optionsType === "object" ? `?${JSON.stringify(this.options)}` : "";
        }
      } else {
        throw new Error(`Invalid request value: ${JSON.stringify(value)}`);
      }
    }
  };
  obj.request = loader;
  Object.preventExtensions && Object.preventExtensions(obj);
  return obj;
}

function runSyncOrAsync(fn, context, args, callback) {
  let isSync = true;
  let isDone = false;
  let isError = false;
  let reportedError = false;
  
  context.async = function() {
    if (isDone) throw new Error("async(): The callback was already called.");
    isSync = false;
    return innerCallback;
  };
  
  const innerCallback = context.callback = function() {
    if (isDone) throw new Error("callback(): The callback was already called.");
    isDone = true;
    isSync = false;
    try {
      callback.apply(null, arguments);
    } catch (e) {
      isError = true;
      throw e;
    }
  };
  
  try {
    const result = fn.apply(context, args);
    if (isSync) {
      isDone = true;
      if (result === undefined) return callback();
      if (result && result.then) {
        return result.then(r => callback(null, r), callback);
      }
      return callback(null, result);
    }
  } catch (e) {
    if (isError) throw e;
    if (isDone) {
      console.error(e.stack || e);
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
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) return processResource(options, loaderContext, callback);
  
  const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  
  if (currentLoader.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(options, loaderContext, callback);
  }
  
  loadLoader(currentLoader, err => {
    if (err) {
      loaderContext.cacheable(false);
      return callback(err);
    }
    
    const pitchFn = currentLoader.pitch;
    currentLoader.pitchExecuted = true;
    if (!pitchFn) return iteratePitchingLoaders(options, loaderContext, callback);
    
    runSyncOrAsync(pitchFn, loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoader.data = {}], (err, ...args) => {
      if (err) return callback(err);
      if (args.some(arg => arg !== undefined)) {
        loaderContext.loaderIndex--;
        iterateNormalLoaders(options, loaderContext, args, callback);
      } else {
        iteratePitchingLoaders(options, loaderContext, callback);
      }
    });
  });
}

function processResource(options, loaderContext, callback) {
  loaderContext.loaderIndex = loaderContext.loaders.length - 1;
  
  const { resourcePath } = loaderContext;
  if (resourcePath) {
    options.processResource(loaderContext, resourcePath, (err, ...args) => {
      if (err) return callback(err);
      options.resourceBuffer = args[0];
      iterateNormalLoaders(options, loaderContext, args, callback);
    });
  } else {
    iterateNormalLoaders(options, loaderContext, [null], callback);
  }
}

function iterateNormalLoaders(options, loaderContext, args, callback) {
  if (loaderContext.loaderIndex < 0) return callback(null, args);
  
  const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }
  
  const normalFn = currentLoader.normal;
  currentLoader.normalExecuted = true;
  if (!normalFn) {
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }
  
  convertArgs(args, currentLoader.raw);
  
  runSyncOrAsync(normalFn, loaderContext, args, (err, ...newArgs) => {
    if (err) return callback(err);
    iterateNormalLoaders(options, loaderContext, newArgs, callback);
  });
}

exports.getContext = function(resource) {
  return dirname(parsePathQueryFragment(resource).path);
};

exports.runLoaders = function(options, callback) {
  const resource = options.resource || "";
  let loaders = options.loaders || [];
  const loaderContext = options.context || {};
  const processResource = options.processResource || ((readResource, context, resource, callback) => {
    context.addDependency(resource);
    readResource(resource, callback);
  }).bind(null, options.readResource || readFile);
  
  const splittedResource = resource && parsePathQueryFragment(resource);
  const resourcePath = splittedResource ? splittedResource.path : undefined;
  const resourceQuery = splittedResource ? splittedResource.query : undefined;
  const resourceFragment = splittedResource ? splittedResource.fragment : undefined;
  const contextDirectory = resourcePath ? dirname(resourcePath) : null;
  
  let requestCacheable = true;
  const fileDependencies = [];
  const contextDependencies = [];
  const missingDependencies = [];
  
  loaders = loaders.map(createLoaderObject);
  
  Object.assign(loaderContext, {
    context: contextDirectory,
    loaderIndex: 0,
    loaders,
    resourcePath,
    resourceQuery,
    resourceFragment,
    async: null,
    callback: null,
    cacheable(flag) {
      if (flag === false) requestCacheable = false;
    },
    dependency: addDependency,
    addDependency,
    addContextDependency(context) {
      contextDependencies.push(context);
    },
    addMissingDependency(context) {
      missingDependencies.push(context);
    },
    getDependencies() {
      return [...fileDependencies];
    },
    getContextDependencies() {
      return [...contextDependencies];
    },
    getMissingDependencies() {
      return [...missingDependencies];
    },
    clearDependencies() {
      fileDependencies.length = 0;
      contextDependencies.length = 0;
      missingDependencies.length = 0;
      requestCacheable = true;
    }
  });

  function addDependency(file) {
    fileDependencies.push(file);
  }
  
  Object.defineProperties(loaderContext, {
    resource: {
      enumerable: true,
      get() {
        return loaderContext.resourcePath === undefined ? undefined
          : `${loaderContext.resourcePath.replace(/#/g, "\0#")}${loaderContext.resourceQuery.replace(/#/g, "\0#")}${loaderContext.resourceFragment}`;
      },
      set(value) {
        const parsed = value && parsePathQueryFragment(value);
        loaderContext.resourcePath = parsed ? parsed.path : undefined;
        loaderContext.resourceQuery = parsed ? parsed.query : undefined;
        loaderContext.resourceFragment = parsed ? parsed.fragment : undefined;
      }
    },
    request: {
      enumerable: true,
      get() {
        return loaderContext.loaders.map(o => o.request).concat(loaderContext.resource || "").join("!");
      }
    },
    remainingRequest: {
      enumerable: true,
      get() {
        if (loaderContext.loaderIndex >= loaderContext.loaders.length - 1 && !loaderContext.resource) return "";
        return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(o => o.request).concat(loaderContext.resource || "").join("!");
      }
    },
    currentRequest: {
      enumerable: true,
      get() {
        return loaderContext.loaders.slice(loaderContext.loaderIndex).map(o => o.request).concat(loaderContext.resource || "").join("!");
      }
    },
    previousRequest: {
      enumerable: true,
      get() {
        return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(o => o.request).join("!");
      }
    },
    query: {
      enumerable: true,
      get() {
        const entry = loaderContext.loaders[loaderContext.loaderIndex];
        return entry.options && typeof entry.options === "object" ? entry.options : entry.query;
      }
    },
    data: {
      enumerable: true,
      get() {
        return loaderContext.loaders[loaderContext.loaderIndex].data;
      }
    }
  });
  
  if (Object.preventExtensions) {
    Object.preventExtensions(loaderContext);
  }
  
  const processOptions = {
    resourceBuffer: null,
    processResource
  };
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    callback(err, { result, resourceBuffer: processOptions.resourceBuffer, cacheable: requestCacheable, fileDependencies, contextDependencies, missingDependencies });
  });
};
