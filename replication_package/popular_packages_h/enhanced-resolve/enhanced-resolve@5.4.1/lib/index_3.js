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
  ({ context, path, request, callback } = normalizeParams(context, path, request, resolveContext, callback));
  asyncResolver.resolve(context, path, request, resolveContext, callback);
}

const syncResolver = ResolverFactory.createResolver({
  conditionNames: ["node"],
  extensions: [".js", ".json", ".node"],
  useSyncFileSystemCalls: true,
  fileSystem: nodeFileSystem
});

function resolveSync(context, path, request) {
  ({ context, path, request } = normalizeSyncParams(context, path, request));
  return syncResolver.resolveSync(context, path, request);
}

function create(options) {
  return createResolverFunction({
    ...options,
    fileSystem: nodeFileSystem
  });
}

function createSync(options) {
  return createSyncResolverFunction({
    ...options,
    useSyncFileSystemCalls: true,
    fileSystem: nodeFileSystem
  });
}

function createResolverFunction(options) {
  const resolver = ResolverFactory.createResolver(options);
  return (context, path, request, resolveContext, callback) => {
    ({ context, path, request, callback } = normalizeParams(context, path, request, resolveContext, callback));
    resolver.resolve(context, path, request, resolveContext, callback);
  };
}

function createSyncResolverFunction(options) {
  const resolver = ResolverFactory.createResolver(options);
  return (context, path, request) => {
    ({ context, path, request } = normalizeSyncParams(context, path, request));
    return resolver.resolveSync(context, path, request);
  };
}

function normalizeParams(context, path, request, resolveContext, callback) {
  if (typeof context === "string") {
    [callback, resolveContext] = [resolveContext, request];
    [request, path, context] = [path, context, nodeContext];
  } else if (typeof callback !== "function") {
    callback = resolveContext;
  }
  return { context, path, request, callback };
}

function normalizeSyncParams(context, path, request) {
  if (typeof context === "string") {
    [request, path, context] = [path, context, nodeContext];
  }
  return { context, path, request };
}

const mergeExports = (obj, exports) => {
  Object.defineProperties(obj, Object.getOwnPropertyDescriptors(exports));
  return Object.freeze(obj);
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
