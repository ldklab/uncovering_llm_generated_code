const fs = require('fs');
const path = require('path');

function loadConfig(cwd = process.cwd()) {
  const configFile = path.resolve(cwd, 'tsconfig.json');
  if (fs.existsSync(configFile)) {
    const { compilerOptions: { baseUrl, paths } = {} } = require(configFile);
    if (baseUrl && paths) {
      return { resultType: 'success', absoluteBaseUrl: path.resolve(cwd, baseUrl), paths };
    }
  }
  return { resultType: 'failed', message: `Cannot find tsconfig.json in ${cwd}` };
}

function register({ baseUrl, paths }) {
  const Module = require('module');
  const originalResolveFilename = Module._resolveFilename;

  Module._resolveFilename = function (request, parent) {
    for (const alias in paths) {
      if (new RegExp(`^${alias}`).test(request)) {
        for (const aliasedPath of paths[alias]) {
          const resolvedPath = path.resolve(baseUrl, aliasedPath.replace('*', request.replace(alias, '')));
          if (fs.existsSync(resolvedPath)) {
            return originalResolveFilename.call(this, resolvedPath, parent);
          }
        }
      }
    }
    return originalResolveFilename.call(this, request, parent);
  };

  return () => {
    Module._resolveFilename = originalResolveFilename;
  };
}

function matchPathWithAlias(absoluteBaseUrl, paths) {
  return function matchPath(requestedModule) {
    for (const alias in paths) {
      if (new RegExp(`^${alias}`).test(requestedModule)) {
        for (const aliasedPath of paths[alias]) {
          const resolvedPath = path.resolve(absoluteBaseUrl, aliasedPath.replace('*', requestedModule.replace(alias, '')));
          if (fs.existsSync(resolvedPath)) return resolvedPath;
        }
      }
    }
    return undefined;
  };
}

function matchFromAbsoluteMappings(mappings, requestedModule, fileExists = fs.existsSync) {
  for (const { alias, paths, baseUrl } of mappings) {
    if (new RegExp(`^${alias}`).test(requestedModule)) {
      for (const mappedPath of paths) {
        const resolvedPath = path.resolve(baseUrl, mappedPath.replace('*', requestedModule.replace(alias, '')));
        if (fileExists(resolvedPath)) return resolvedPath;
      }
    }
  }
  return undefined;
}

function createAsyncMatcher(...args) {
  return function(requestedModule, callback) {
    const matchPath = matchPathWithAlias(...args);
    const result = matchPath(requestedModule);
    process.nextTick(() => callback(null, result));
  };
}

function asyncMatchFromMappings(mappings, requestedModule, fileExists = fs.existsSync, callback) {
  const result = matchFromAbsoluteMappings(mappings, requestedModule, fileExists);
  process.nextTick(() => callback(null, result));
}

module.exports = {
  register,
  loadConfig,
  createMatchPath: matchPathWithAlias,
  matchFromAbsolutePaths: matchFromAbsoluteMappings,
  createMatchPathAsync: createAsyncMatcher,
  matchFromAbsolutePathsAsync: asyncMatchFromMappings,
};
```