const fs = require('fs');
const path = require('path');

function loadConfig(directory = process.cwd()) {
  const configFile = path.join(directory, 'tsconfig.json');
  if (fs.existsSync(configFile)) {
    const tsconfig = require(configFile);
    const { baseUrl, paths } = tsconfig.compilerOptions || {};
    if (baseUrl && paths) {
      return { resultType: 'success', absoluteBaseUrl: path.resolve(directory, baseUrl), paths };
    }
  }
  return { resultType: 'failed', message: `Cannot find tsconfig.json in ${directory}` };
}

function register({ baseUrl, paths }) {
  const Module = require('module');
  const originalResolve = Module._resolveFilename;

  Module._resolveFilename = function (request, parentModule, isMain, options) {
    for (const alias in paths) {
      if (request.startsWith(alias)) {
        const aliases = paths[alias];
        for (const aliasPath of aliases) {
          const potentialPath = path.resolve(baseUrl, aliasPath.replace('*', request.slice(alias.length)));
          if (fs.existsSync(potentialPath)) {
            return originalResolve.call(this, potentialPath, parentModule, isMain, options);
          }
        }
      }
    }
    return originalResolve.call(this, request, parentModule, isMain, options);
  };

  return () => {
    Module._resolveFilename = originalResolve;
  };
}

function createMatchPath(absoluteBaseUrl, paths, fields = ["main"], allowAll = true) {
  return function (moduleRequest) {
    for (const alias in paths) {
      if (moduleRequest.startsWith(alias)) {
        const aliasedPaths = paths[alias];
        for (const aliasedPath of aliasedPaths) {
          const resolved = path.resolve(absoluteBaseUrl, aliasedPath.replace('*', moduleRequest.slice(alias.length)));
          if (fs.existsSync(resolved)) {
            return resolved;
          }
        }
      }
    }
    return undefined;
  };
}

function matchFromAbsolutePaths(mappingEntries, moduleRequest, existsCheck = fs.existsSync) {
  for (const { alias, paths: aliases, baseUrl } of mappingEntries) {
    if (moduleRequest.startsWith(alias)) {
      for (const aliasPath of aliases) {
        const resolved = path.resolve(baseUrl, aliasPath.replace('*', moduleRequest.slice(alias.length)));
        if (existsCheck(resolved)) {
          return resolved;
        }
      }
    }
  }
  return undefined;
}

function createMatchPathAsync(...args) {
  return function (moduleRequest, callback) {
    const resolver = createMatchPath(...args);
    const foundPath = resolver(moduleRequest);
    process.nextTick(() => callback(null, foundPath));
  };
}

function matchFromAbsolutePathsAsync(mappingEntries, moduleRequest, existsCheck = fs.existsSync, callback) {
  const foundPath = matchFromAbsolutePaths(mappingEntries, moduleRequest, existsCheck);
  process.nextTick(() => callback(null, foundPath));
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