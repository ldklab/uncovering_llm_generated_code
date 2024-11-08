const fs = require('fs');
const path = require('path');

function loadConfig(cwd = process.cwd()) {
  const configPath = path.resolve(cwd, 'tsconfig.json');
  if (fs.existsSync(configPath)) {
    const config = require(configPath);
    const { baseUrl, paths } = config.compilerOptions || {};
    if (baseUrl && paths) {
      return { resultType: 'success', absoluteBaseUrl: path.resolve(cwd, baseUrl), paths };
    }
  }
  return { resultType: 'failed', message: `Cannot find tsconfig.json in ${cwd}` };
}

function register({ baseUrl, paths }) {
  const originalResolveFilename = require('module')._resolveFilename;
  require('module')._resolveFilename = function (request, parent) {
    for (const alias in paths) {
      if (new RegExp(`^${alias}`).test(request)) {
        const aliasedPaths = paths[alias];
        for (const aliasedPath of aliasedPaths) {
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
    require('module')._resolveFilename = originalResolveFilename;
  };
}

function createMatchPath(absoluteBaseUrl, paths, mainFields = ["main"], addMatchAll = true) {
  return function matchPath(requestedModule) {
    for (const alias in paths) {
      if (new RegExp(`^${alias}`).test(requestedModule)) {
        const aliasedPaths = paths[alias];
        for (const aliasedPath of aliasedPaths) {
          const resolvedPath = path.resolve(absoluteBaseUrl, aliasedPath.replace('*', requestedModule.replace(alias, '')));
          if (fs.existsSync(resolvedPath)) {
            return resolvedPath;
          }
        }
      }
    }
    return undefined;
  };
}

function matchFromAbsolutePaths(absolutePathMappings, requestedModule, fileExists = fs.existsSync) {
  for (const mapping of absolutePathMappings) {
    if (new RegExp(`^${mapping.alias}`).test(requestedModule)) {
      const mappedPaths = mapping.paths;
      for (const mappedPath of mappedPaths) {
        const resolvedPath = path.resolve(mapping.baseUrl, mappedPath.replace('*', requestedModule.replace(mapping.alias, '')));
        if (fileExists(resolvedPath)) {
          return resolvedPath;
        }
      }
    }
  }
  return undefined;
}

function createMatchPathAsync(...args) {
  return function(requestedModule, callback) {
    const matchPath = createMatchPath(...args);
    const result = matchPath(requestedModule);
    process.nextTick(() => callback(null, result));
  };
}

function matchFromAbsolutePathsAsync(absolutePathMappings, requestedModule, fileExists = fs.existsSync, callback) {
  const result = matchFromAbsolutePaths(absolutePathMappings, requestedModule, fileExists);
  process.nextTick(() => callback(null, result));
}

module.exports = {
  register,
  loadConfig,
  createMatchPath,
  matchFromAbsolutePaths,
  createMatchPathAsync,
  matchFromAbsolutePathsAsync,
};
```