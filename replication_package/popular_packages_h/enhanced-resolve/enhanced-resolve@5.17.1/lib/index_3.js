"use strict";

const fs = require("graceful-fs");
const CachedInputFileSystem = require("./CachedInputFileSystem");
const ResolverFactory = require("./ResolverFactory");

const nodeFileSystem = new CachedInputFileSystem(fs, 4000);
const nodeContext = { environments: ["node+es3+es5+process+native"] };

const createBaseResolver = (options, sync = false) =>
  ResolverFactory.createResolver({
    conditionNames: ["node"],
    extensions: [".js", ".json", ".node"],
    useSyncFileSystemCalls: sync,
    fileSystem: nodeFileSystem,
    ...options
  });

const resolveAsync = (resolver) => (context, path, request, resolveContext, callback) => {
  if (typeof context === "string") {
    callback = resolveContext;
    resolveContext = request;
    request = path;
    path = context;
    context = nodeContext;
  }
  callback = typeof callback !== "function" ? resolveContext : callback;
  resolver.resolve(context, path, request, resolveContext, callback);
};

const resolveSync = (resolver) => (context, path, request) => {
  if (typeof context === "string") {
    request = path;
    path = context;
    context = nodeContext;
  }
  return resolver.resolveSync(context, path, request);
};

function create(options) {
  const resolver = createBaseResolver(options);
  return resolveAsync(resolver);
}

function createSync(options) {
  const resolver = createBaseResolver(options, true);
  return resolveSync(resolver);
}

const mergeExports = (obj, exports) => {
  const descriptors = Object.getOwnPropertyDescriptors(exports);
  Object.defineProperties(obj, descriptors);
  return Object.freeze(obj);
};

module.exports = mergeExports(resolveAsync(createBaseResolver()), {
  get sync() {
    return resolveSync(createBaseResolver({}, true));
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
