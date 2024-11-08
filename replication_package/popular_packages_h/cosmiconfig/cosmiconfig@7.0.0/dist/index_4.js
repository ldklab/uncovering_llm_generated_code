"use strict";

const os = require("os");
const { Explorer } = require("./Explorer");
const { ExplorerSync } = require("./ExplorerSync");
const { loaders: defaultLoaders } = require("./loaders");

// Function to create an asynchronous explorer for a given module
function cosmiconfig(moduleName, options = {}) {
  const normalizedOptions = getNormalizedOptions(moduleName, options);
  const explorer = new Explorer(normalizedOptions);
  return {
    search: explorer.search.bind(explorer),
    load: explorer.load.bind(explorer),
    clearLoadCache: explorer.clearLoadCache.bind(explorer),
    clearSearchCache: explorer.clearSearchCache.bind(explorer),
    clearCaches: explorer.clearCaches.bind(explorer),
  };
}

// Function to create a synchronous explorer for a given module
function cosmiconfigSync(moduleName, options = {}) {
  const normalizedOptions = getNormalizedOptions(moduleName, options);
  const explorerSync = new ExplorerSync(normalizedOptions);
  return {
    search: explorerSync.searchSync.bind(explorerSync),
    load: explorerSync.loadSync.bind(explorerSync),
    clearLoadCache: explorerSync.clearLoadCache.bind(explorerSync),
    clearSearchCache: explorerSync.clearSearchCache.bind(explorerSync),
    clearCaches: explorerSync.clearCaches.bind(explorerSync),
  };
}

// Default loaders for configuration file extensions
const frozenDefaultLoaders = Object.freeze({
  '.cjs': defaultLoaders.loadJs,
  '.js': defaultLoaders.loadJs,
  '.json': defaultLoaders.loadJson,
  '.yaml': defaultLoaders.loadYaml,
  '.yml': defaultLoaders.loadYaml,
  noExt: defaultLoaders.loadYaml,
});

// Function to apply default settings on options and merge user-provided options
function getNormalizedOptions(moduleName, options) {
  const defaults = {
    packageProp: moduleName,
    searchPlaces: [
      'package.json',
      `.${moduleName}rc`,
      `.${moduleName}rc.json`,
      `.${moduleName}rc.yaml`,
      `.${moduleName}rc.yml`,
      `.${moduleName}rc.js`,
      `.${moduleName}rc.cjs`,
      `${moduleName}.config.js`,
      `${moduleName}.config.cjs`,
    ],
    ignoreEmptySearchPlaces: true,
    stopDir: os.homedir(),
    cache: true,
    transform: (x) => x,
    loaders: frozenDefaultLoaders,
  };

  return {
    ...defaults,
    ...options,
    loaders: {
      ...defaults.loaders,
      ...options.loaders,
    },
  };
}

module.exports = { cosmiconfig, cosmiconfigSync, frozenDefaultLoaders };
