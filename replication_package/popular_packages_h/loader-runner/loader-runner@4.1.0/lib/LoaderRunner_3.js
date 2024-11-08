const fs = require('fs');
const readFile = fs.readFile.bind(fs);
const loadLoader = require('./loadLoader');

function utf8BufferToString(buf) {
  let str = buf.toString('utf-8');
  return str.charCodeAt(0) === 0xFEFF ? str.substr(1) : str;
}

const PATH_QUERY_FRAGMENT_REGEXP = /^((?:\0.|[^?#\0])*)(\?(?:\0.|[^#\0])*)?(#.*)?$/;

function parsePathQueryFragment(str) {
  const match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
  return {
    path: match[1].replace(/\0(.)/g, '$1'),
    query: match[2] ? match[2].replace(/\0(.)/g, '$1') : '',
    fragment: match[3] || ''
  };
}

function dirname(path) {
  if (path === '/') return '/';
  const i = path.lastIndexOf('/');
  const j = path.lastIndexOf('\\');
  const idx = Math.max(i, j);
  return idx < 0 ? path : path.slice(0, idx + 1);
}

function createLoaderObject(loader) {
  const obj = {
    path: null, query: null, fragment: null, options: null, ident: null,
    normal: null, pitch: null, raw: null, data: null,
    pitchExecuted: false, normalExecuted: false,
  };
  Object.defineProperty(obj, 'request', {
    enumerable: true,
    get() {
      return `${obj.path.replace(/#/g, '\0#')}${obj.query.replace(/#/g, '\0#')}${obj.fragment}`;
    },
    set(value) {
      if (typeof value === 'string') {
        const { path, query, fragment } = parsePathQueryFragment(value);
        obj.path = path;
        obj.query = query;
        obj.fragment = fragment;
        obj.options = undefined;
        obj.ident = undefined;
      } else {
        if (!value.loader) throw new Error(`request should be a string or object with loader and options (${JSON.stringify(value)})`);
        obj.path = value.loader;
        obj.fragment = value.fragment || '';
        obj.type = value.type;
        obj.options = value.options;
        obj.ident = value.ident;
        obj.query = obj.ident ? `??${obj.ident}` : obj.options ? `?${JSON.stringify(obj.options)}` : '';
      }
    }
  });
  obj.request = loader;
  return obj;
}

function runSyncOrAsync(fn, context, args, callback) {
  let isSync = true, isDone = false, isError = false, reportedError = false;
  context.async = function async() {
    if (isDone) throw new Error("async(): The callback was already called.");
    isSync = false;
    return innerCallback;
  };
  const innerCallback = context.callback = function () {
    if (isDone) throw new Error("callback(): The callback was already called.");
    isDone = true;
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
      if (result && typeof result === 'object' && typeof result.then === 'function') {
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
  } else if (raw && typeof args[0] === 'string') {
    args[0] = Buffer.from(args[0], 'utf-8');
  }
}

function iteratePitchingLoaders(options, loaderContext, callback) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length)
    return processResource(options, loaderContext, callback);

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  loadLoader(currentLoaderObject, function (err) {
    if (err) {
      loaderContext.cacheable(false);
      return callback(err);
    }
    const fn = currentLoaderObject.pitch;
    currentLoaderObject.pitchExecuted = true;
    if (!fn) return iteratePitchingLoaders(options, loaderContext, callback);

    runSyncOrAsync(fn, loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}], function (err) {
      if (err) return callback(err);
      const args = Array.from(arguments).slice(1);
      const hasArg = args.some(value => value !== undefined);
      if (hasArg) {
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
  const resourcePath = loaderContext.resourcePath;
  if (resourcePath) {
    loaderContext.addDependency(resourcePath);
    options.readResource(resourcePath, function (err, buffer) {
      if (err) return callback(err);
      options.resourceBuffer = buffer;
      iterateNormalLoaders(options, loaderContext, [buffer], callback);
    });
  } else {
    iterateNormalLoaders(options, loaderContext, [null], callback);
  }
}

function iterateNormalLoaders(options, loaderContext, args, callback) {
  if (loaderContext.loaderIndex < 0) return callback(null, args);

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  const fn = currentLoaderObject.normal;
  currentLoaderObject.normalExecuted = true;
  if (!fn) return iterateNormalLoaders(options, loaderContext, args, callback);

  convertArgs(args, currentLoaderObject.raw);

  runSyncOrAsync(fn, loaderContext, args, function (err) {
    if (err) return callback(err);
    iterateNormalLoaders(options, loaderContext, Array.from(arguments).slice(1), callback);
  });
}

exports.getContext = function getContext(resource) {
  return dirname(parsePathQueryFragment(resource).path);
};

exports.runLoaders = function runLoaders(options, callback) {
  const { resource = '', loaders = [], context = {}, readResource = readFile } = options;
  const splittedResource = parsePathQueryFragment(resource);
  const resourcePath = splittedResource.path;
  const resourceQuery = splittedResource.query;
  const resourceFragment = splittedResource.fragment;
  const contextDirectory = resourcePath ? dirname(resourcePath) : null;

  let requestCacheable = true;
  const fileDependencies = [];
  const contextDependencies = [];
  const missingDependencies = [];

  const loaderObjects = loaders.map(createLoaderObject);

  Object.assign(context, {
    context: contextDirectory,
    loaderIndex: 0,
    loaders: loaderObjects,
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
    addContextDependency(dependency) {
      contextDependencies.push(dependency);
    },
    addMissingDependency(dependency) {
      missingDependencies.push(dependency);
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

  Object.defineProperty(context, 'resource', {
    enumerable: true,
    get() {
      if (!resourcePath) return undefined;
      return `${resourcePath.replace(/#/g, '\0#')}${resourceQuery.replace(/#/g, '\0#')}${resourceFragment}`;
    },
    set(value) {
      const { path, query, fragment } = parsePathQueryFragment(value);
      context.resourcePath = path;
      context.resourceQuery = query;
      context.resourceFragment = fragment;
    }
  });

  Object.defineProperty(context, 'request', {
    enumerable: true,
    get() {
      return [
        ...context.loaders.map(o => o.request),
        context.resource ? context.resource : ''
      ].join('!');
    }
  });

  Object.defineProperty(context, 'remainingRequest', {
    enumerable: true,
    get() {
      if (context.loaderIndex >= context.loaders.length - 1 && !context.resource) return '';
      return [
        ...context.loaders.slice(context.loaderIndex + 1).map(o => o.request),
        context.resource ? context.resource : ''
      ].join('!');
    }
  });

  Object.defineProperty(context, 'currentRequest', {
    enumerable: true,
    get() {
      return [
        ...context.loaders.slice(context.loaderIndex).map(o => o.request),
        context.resource ? context.resource : ''
      ].join('!');
    }
  });

  Object.defineProperty(context, 'previousRequest', {
    enumerable: true,
    get() {
      return context.loaders.slice(0, context.loaderIndex).map(o => o.request).join('!');
    }
  });

  Object.defineProperty(context, 'query', {
    enumerable: true,
    get() {
      const entry = context.loaders[context.loaderIndex];
      return entry.options && typeof entry.options === 'object' ? entry.options : entry.query;
    }
  });

  Object.defineProperty(context, 'data', {
    enumerable: true,
    get() {
      return context.loaders[context.loaderIndex].data;
    }
  });

  const processOptions = {
    resourceBuffer: null,
    readResource
  };

  iteratePitchingLoaders(processOptions, context, function (err, result) {
    if (err) return callback(err, {
      cacheable: requestCacheable,
      fileDependencies,
      contextDependencies,
      missingDependencies
    });

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
