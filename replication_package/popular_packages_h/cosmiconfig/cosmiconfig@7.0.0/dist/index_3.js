"use strict";

const os = require("os");
const { Explorer } = require("./Explorer");
const { ExplorerSync } = require("./ExplorerSync");
const { loaders } = require("./loaders");

exports.cosmiconfig = cosmiconfig;
exports.cosmiconfigSync = cosmiconfigSync;
exports.defaultLoaders = Object.freeze({
  '.cjs': loaders.loadJs,
  '.js': loaders.loadJs,
  '.json': loaders.loadJson,
  '.yaml': loaders.loadYaml,
  '.yml': loaders.loadYaml,
  noExt: loaders.loadYaml
});

function cosmiconfig(moduleName, options = {}) {
  const normalizedOptions = normalizeOptions(moduleName, options);
  const explorer = new Explorer(normalizedOptions);
  return {
    search: explorer.search.bind(explorer),
    load: explorer.load.bind(explorer),
    clearLoadCache: explorer.clearLoadCache.bind(explorer),
    clearSearchCache: explorer.clearSearchCache.bind(explorer),
    clearCaches: explorer.clearCaches.bind(explorer)
  };
}

function cosmiconfigSync(moduleName, options = {}) {
  const normalizedOptions = normalizeOptions(moduleName, options);
  const explorerSync = new ExplorerSync(normalizedOptions);
  return {
    search: explorerSync.searchSync.bind(explorerSync),
    load: explorerSync.loadSync.bind(explorerSync),
    clearLoadCache: explorerSync.clearLoadCache.bind(explorerSync),
    clearSearchCache: explorerSync.clearSearchCache.bind(explorerSync),
    clearCaches: explorerSync.clearCaches.bind(explorerSync)
  };
}

function normalizeOptions(moduleName, options) {
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
      `${moduleName}.config.cjs`
    ],
    ignoreEmptySearchPlaces: true,
    stopDir: os.homedir(),
    cache: true,
    transform: x => x,
    loaders: exports.defaultLoaders
  };
  
  return {
    ...defaults,
    ...options,
    loaders: {
      ...defaults.loaders,
      ...options.loaders
    }
  };
}
