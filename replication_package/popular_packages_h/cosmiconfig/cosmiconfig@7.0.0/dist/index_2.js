"use strict";

import os from 'os';
import { Explorer } from './Explorer';
import { ExplorerSync } from './ExplorerSync';
import { loaders as defaultLoadersModule } from './loaders';

export function cosmiconfig(moduleName, options = {}) {
  const normalizedOptions = getNormalizedOptions(moduleName, options);
  const explorer = new Explorer(normalizedOptions);
  return createExplorerAPI(explorer);
}

export function cosmiconfigSync(moduleName, options = {}) {
  const normalizedOptions = getNormalizedOptions(moduleName, options);
  const explorerSync = new ExplorerSync(normalizedOptions);
  return createExplorerAPI(explorerSync);
}

const defaultLoaders = Object.freeze({
  '.cjs': defaultLoadersModule.loadJs,
  '.js': defaultLoadersModule.loadJs,
  '.json': defaultLoadersModule.loadJson,
  '.yaml': defaultLoadersModule.loadYaml,
  '.yml': defaultLoadersModule.loadYaml,
  noExt: defaultLoadersModule.loadYaml
});

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
      `${moduleName}.config.cjs`
    ],
    ignoreEmptySearchPlaces: true,
    stopDir: os.homedir(),
    cache: true,
    transform: x => x,
    loaders: defaultLoaders
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

function createExplorerAPI(explorer) {
  return {
    search: explorer.search.bind(explorer),
    load: explorer.load.bind(explorer),
    clearLoadCache: explorer.clearLoadCache.bind(explorer),
    clearSearchCache: explorer.clearSearchCache.bind(explorer),
    clearCaches: explorer.clearCaches.bind(explorer)
  };
}

export { defaultLoaders };
