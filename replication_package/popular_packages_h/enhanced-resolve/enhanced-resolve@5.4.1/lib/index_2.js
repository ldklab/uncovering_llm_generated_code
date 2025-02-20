"use strict";

const fs = require("graceful-fs");
const CachedInputFileSystem = require("./CachedInputFileSystem");
const ResolverFactory = require("./ResolverFactory");

const nodeFileSystem = new CachedInputFileSystem(fs, 4000);
const nodeContext = { environments: ["node+es3+es5+process+native"] };

const asyncResolver = ResolverFactory.createResolver({
    conditionNames: ["node"],
    extensions: [".js", ".json", ".node"],
    fileSystem: nodeFileSystem
});

function resolve(context, path, request, resolveContext, callback) {
    if (typeof context === "string") {
        callback = resolveContext;
        resolveContext = request;
        request = path;
        path = context;
        context = nodeContext;
    }
    if (typeof callback !== "function") {
        callback = resolveContext;
    }
    asyncResolver.resolve(context, path, request, resolveContext, callback);
}

const syncResolver = ResolverFactory.createResolver({
    conditionNames: ["node"],
    extensions: [".js", ".json", ".node"],
    useSyncFileSystemCalls: true,
    fileSystem: nodeFileSystem
});

function resolveSync(context, path, request) {
    if (typeof context === "string") {
        request = path;
        path = context;
        context = nodeContext;
    }
    return syncResolver.resolveSync(context, path, request);
}

function create(options) {
    options = { fileSystem: nodeFileSystem, ...options };
    const resolver = ResolverFactory.createResolver(options);
    return function (context, path, request, resolveContext, callback) {
        if (typeof context === "string") {
            callback = resolveContext;
            resolveContext = request;
            request = path;
            path = context;
            context = nodeContext;
        }
        if (typeof callback !== "function") {
            callback = resolveContext;
        }
        resolver.resolve(context, path, request, resolveContext, callback);
    };
}

function createSync(options) {
    options = { useSyncFileSystemCalls: true, fileSystem: nodeFileSystem, ...options };
    const resolver = ResolverFactory.createResolver(options);
    return function (context, path, request) {
        if (typeof context === "string") {
            request = path;
            path = context;
            context = nodeContext;
        }
        return resolver.resolveSync(context, path, request);
    };
}

const mergeExports = (obj, exports) => {
    const descriptors = Object.getOwnPropertyDescriptors(exports);
    Object.defineProperties(obj, descriptors);
    return /** @type {A & B} */ (Object.freeze(obj));
};

module.exports = mergeExports(resolve, {
    get sync() {
        return resolveSync;
    },
    create: mergeExports(create, {
        get sync() {
            return createSync;
        }
    }),
    ResolverFactory,
    CachedInputFileSystem,
    get CloneBasenamePlugin() {
        return require("./CloneBasenamePlugin");
    },
    get LogInfoPlugin() {
        return require("./LogInfoPlugin");
    },
    get forEachBail() {
        return require("./forEachBail");
    }
});
