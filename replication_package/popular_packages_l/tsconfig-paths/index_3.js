const fs = require('fs');
const path = require('path');

/**
 * Load the TypeScript configuration file (tsconfig.json) from a given directory.
 * @param {string} cwd - The current working directory.
 * @returns {Object} - Returns an object with the result status and configuration details.
 */
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

/**
 * Registers a custom module resolution logic that respects path aliases from tsconfig.json.
 * @param {Object} options - An object containing baseUrl and paths.
 * @returns {Function} - A function to restore the original module resolution mechanism.
 */
function register({ baseUrl, paths }) {
  const Module = require('module');
  const originalResolveFilename = Module._resolveFilename;
  
  Module._resolveFilename = function(request, parent) {
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
    Module._resolveFilename = originalResolveFilename;
  };
}

/**
 * Creates a synchronous function to match and resolve module paths using custom alias paths.
 * @param {string} absoluteBaseUrl - The base URL for module resolution.
 * @param {Object} paths - An object containing path aliases and their resolutions.
 * @param {Array} mainFields - The main fields used for resolution (default is ["main"]).
 * @param {boolean} addMatchAll - Whether to add match all functionalities.
 * @returns {Function} - A function to match paths based on aliases.
 */
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

/**
 * Resolves paths from absolute path mappings for requested modules.
 * @param {Array} absolutePathMappings - An array of path mapping objects.
 * @param {string} requestedModule - The module requested for resolution.
 * @param {Function} fileExists - A function to check if a file exists.
 * @returns {string|undefined} - Returns resolved path or undefined.
 */
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

/**
 * Creates an asynchronous version of the matchPath function.
 * @param {...*} args - The arguments for createMatchPath function.
 * @returns {Function} - A function that resolves the module path asynchronously.
 */
function createMatchPathAsync(...args) {
  return function(requestedModule, callback) {
    const matchPath = createMatchPath(...args);
    const result = matchPath(requestedModule);
    process.nextTick(() => callback(null, result));
  };
}

/**
 * Resolves paths from absolute path mappings asynchronously.
 * @param {Array} absolutePathMappings - An array of path mapping objects.
 * @param {string} requestedModule - The module requested for resolution.
 * @param {Function} fileExists - A function to check if a file exists.
 * @param {Function} callback - Callback function to pass the resolved path.
 */
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