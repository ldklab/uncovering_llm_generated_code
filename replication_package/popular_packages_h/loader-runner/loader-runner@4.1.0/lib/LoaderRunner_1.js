const fs = require("fs");
const readFile = fs.readFile.bind(fs);
const loadLoader = require("./loadLoader");

function utf8BufferToString(buf) {
    const str = buf.toString("utf-8");
    return str.charCodeAt(0) === 0xFEFF ? str.substr(1) : str;
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
    const idx = i > j ? i : j;
    return idx < 0 ? path : path.substr(0, idx + 1);
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
        get: function() {
            return obj.path.replace(/#/g, "\0#") + obj.query.replace(/#/g, "\0#") + obj.fragment;
        },
        set: function(value) {
            if (typeof value === "string") {
                const { path, query, fragment } = parsePathQueryFragment(value);
                obj.path = path;
                obj.query = query;
                obj.fragment = fragment;
                obj.options = undefined;
                obj.ident = undefined;
            } else {
                if (!value.loader) {
                    throw new Error("request should be a string or object with loader and options (" + JSON.stringify(value) + ")");
                }
                obj.path = value.loader;
                obj.fragment = value.fragment || "";
                obj.type = value.type;
                obj.options = value.options;
                obj.ident = value.ident;
                if (!obj.options) {
                    obj.query = "";
                } else if (typeof obj.options === "string") {
                    obj.query = "?" + obj.options;
                } else if (obj.ident) {
                    obj.query = "??" + obj.ident;
                } else if (typeof obj.options === "object" && obj.options.ident) {
                    obj.query = "??" + obj.options.ident;
                } else {
                    obj.query = "?" + JSON.stringify(obj.options);
                }
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
    let isError = false;
    let reportedError = false;
    context.async = function async() {
        if (isDone) {
            if (reportedError) return;
            throw new Error("async(): The callback was already called.");
        }
        isSync = false;
        return innerCallback;
    };
    const innerCallback = context.callback = function() {
        if (isDone) {
            if (reportedError) return;
            throw new Error("callback(): The callback was already called.");
        }
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
        const result = (function LOADER_EXECUTION() {
            return fn.apply(context, args);
        })();
        if (isSync) {
            isDone = true;
            if (result === undefined) return callback();
            if (result && typeof result === "object" && typeof result.then === "function") {
                return result.then(r => callback(null, r), callback);
            }
            return callback(null, result);
        }
    } catch (e) {
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
    loadLoader(currentLoaderObject, function(err) {
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
            function(err) {
                if (err) return callback(err);
                const args = Array.prototype.slice.call(arguments, 1);
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
        options.readResource(resourcePath, function(err, buffer) {
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
    runSyncOrAsync(fn, loaderContext, args, function(err) {
        if (err) return callback(err);
        const args = Array.prototype.slice.call(arguments, 1);
        iterateNormalLoaders(options, loaderContext, args, callback);
    });
}

exports.getContext = function getContext(resource) {
    const path = parsePathQueryFragment(resource).path;
    return dirname(path);
};

exports.runLoaders = function runLoaders(options, callback) {
    const resource = options.resource || "";
    let loaders = options.loaders || [];
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

    loaders = loaders.map(createLoaderObject);

    loaderContext.context = contextDirectory;
    loaderContext.loaderIndex = 0;
    loaderContext.loaders = loaders;
    loaderContext.resourcePath = resourcePath;
    loaderContext.resourceQuery = resourceQuery;
    loaderContext.resourceFragment = resourceFragment;
    loaderContext.async = null;
    loaderContext.callback = null;
    loaderContext.cacheable = function cacheable(flag) {
        if (flag === false) {
            requestCacheable = false;
        }
    };
    loaderContext.dependency = loaderContext.addDependency = function addDependency(file) {
        fileDependencies.push(file);
    };
    loaderContext.addContextDependency = function addContextDependency(context) {
        contextDependencies.push(context);
    };
    loaderContext.addMissingDependency = function addMissingDependency(context) {
        missingDependencies.push(context);
    };
    loaderContext.getDependencies = function() {
        return fileDependencies.slice();
    };
    loaderContext.getContextDependencies = function() {
        return contextDependencies.slice();
    };
    loaderContext.getMissingDependencies = function() {
        return missingDependencies.slice();
    };
    loaderContext.clearDependencies = function() {
        fileDependencies.length = 0;
        contextDependencies.length = 0;
        missingDependencies.length = 0;
        requestCacheable = true;
    };
    Object.defineProperty(loaderContext, "resource", {
        enumerable: true,
        get: function() {
            if (loaderContext.resourcePath === undefined) return undefined;
            return loaderContext.resourcePath.replace(/#/g, "\0#") + loaderContext.resourceQuery.replace(/#/g, "\0#") + loaderContext.resourceFragment;
        },
        set: function(value) {
            const splittedResource = value && parsePathQueryFragment(value);
            loaderContext.resourcePath = splittedResource ? splittedResource.path : undefined;
            loaderContext.resourceQuery = splittedResource ? splittedResource.query : undefined;
            loaderContext.resourceFragment = splittedResource ? splittedResource.fragment : undefined;
        }
    });
    Object.defineProperty(loaderContext, "request", {
        enumerable: true,
        get: function() {
            return loaderContext.loaders.map(o => o.request).concat(loaderContext.resource || "").join("!");
        }
    });
    Object.defineProperty(loaderContext, "remainingRequest", {
        enumerable: true,
        get: function() {
            if (loaderContext.loaderIndex >= loaderContext.loaders.length - 1 && !loaderContext.resource) return "";
            return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(o => o.request).concat(loaderContext.resource || "").join("!");
        }
    });
    Object.defineProperty(loaderContext, "currentRequest", {
        enumerable: true,
        get: function() {
            return loaderContext.loaders.slice(loaderContext.loaderIndex).map(o => o.request).concat(loaderContext.resource || "").join("!");
        }
    });
    Object.defineProperty(loaderContext, "previousRequest", {
        enumerable: true,
        get: function() {
            return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(o => o.request).join("!");
        }
    });
    Object.defineProperty(loaderContext, "query", {
        enumerable: true,
        get: function() {
            const entry = loaderContext.loaders[loaderContext.loaderIndex];
            return entry.options && typeof entry.options === "object" ? entry.options : entry.query;
        }
    });
    Object.defineProperty(loaderContext, "data", {
        enumerable: true,
        get: function() {
            return loaderContext.loaders[loaderContext.loaderIndex].data;
        }
    });

    if (Object.preventExtensions) {
        Object.preventExtensions(loaderContext);
    }

    const processOptions = {
        resourceBuffer: null,
        readResource: readResource
    };
    iteratePitchingLoaders(processOptions, loaderContext, function(err, result) {
        if (err) {
            return callback(err, {
                cacheable: requestCacheable,
                fileDependencies: fileDependencies,
                contextDependencies: contextDependencies,
                missingDependencies: missingDependencies
            });
        }
        callback(null, {
            result: result,
            resourceBuffer: processOptions.resourceBuffer,
            cacheable: requestCacheable,
            fileDependencies: fileDependencies,
            contextDependencies: contextDependencies,
            missingDependencies: missingDependencies
        });
    });
};
