"use strict";
const { 
    defaultLoaders, 
    defaultLoadersSync, 
    getDefaultSearchPlaces, 
    getDefaultSearchPlacesSync, 
    globalConfigSearchPlaces, 
    globalConfigSearchPlacesSync, 
    metaSearchPlaces 
} = require("./defaults");
const { Explorer } = require("./Explorer.js");
const { ExplorerSync } = require("./ExplorerSync.js");
const { removeUndefinedValuesFromObject } = require("./util");

exports.defaultLoaders = defaultLoaders;
exports.defaultLoadersSync = defaultLoadersSync;
exports.getDefaultSearchPlaces = getDefaultSearchPlaces;
exports.getDefaultSearchPlacesSync = getDefaultSearchPlacesSync;
exports.globalConfigSearchPlaces = globalConfigSearchPlaces;
exports.globalConfigSearchPlacesSync = globalConfigSearchPlacesSync;

const identity = (x) => x;

function getUserDefinedOptionsFromMetaConfig() {
    const metaExplorer = new ExplorerSync({
        moduleName: 'cosmiconfig',
        stopDir: process.cwd(),
        searchPlaces: metaSearchPlaces,
        ignoreEmptySearchPlaces: false,
        applyPackagePropertyPathToConfiguration: true,
        loaders: defaultLoaders,
        transform: identity,
        cache: true,
        metaConfigFilePath: null,
        mergeImportArrays: true,
        mergeSearchPlaces: true,
        searchStrategy: 'none',
    });

    const metaConfig = metaExplorer.search();
    if (!metaConfig) return null;

    if (metaConfig.config?.loaders) throw new Error('Cannot specify loaders in meta config file');
    if (metaConfig.config?.searchStrategy) throw new Error('Cannot specify searchStrategy in meta config file');

    const overrideOptions = { 
        mergeSearchPlaces: true, 
        ...(metaConfig.config ?? {}) 
    };
    return {
        config: removeUndefinedValuesFromObject(overrideOptions),
        filepath: metaConfig.filepath,
    };
}

function resolveSearchPlaces(moduleName, toolDefinedSearchPlaces, userConfiguredOptions) {
    const userConfiguredSearchPlaces = userConfiguredOptions.searchPlaces?.map(path => path.replace('{name}', moduleName));
    return userConfiguredOptions.mergeSearchPlaces 
        ? [...(userConfiguredSearchPlaces ?? []), ...toolDefinedSearchPlaces] 
        : (userConfiguredSearchPlaces ?? toolDefinedSearchPlaces);
}

function mergeOptionsBase(moduleName, defaults, options) {
    const userDefinedConfig = getUserDefinedOptionsFromMetaConfig();
    if (!userDefinedConfig) {
        return {
            ...defaults,
            ...removeUndefinedValuesFromObject(options),
            loaders: {
                ...defaults.loaders,
                ...options.loaders,
            }
        };
    }
    
    const userConfiguredOptions = userDefinedConfig.config;
    const toolDefinedSearchPlaces = options.searchPlaces ?? defaults.searchPlaces;
    return {
        ...defaults,
        ...removeUndefinedValuesFromObject(options),
        metaConfigFilePath: userDefinedConfig.filepath,
        ...userConfiguredOptions,
        searchPlaces: resolveSearchPlaces(moduleName, toolDefinedSearchPlaces, userConfiguredOptions),
        loaders: {
            ...defaults.loaders,
            ...options.loaders,
        }
    };
}

function validateOptions(options) {
    if (options.searchStrategy && options.searchStrategy !== 'global' && options.stopDir) {
        throw new Error('Cannot supply `stopDir` option with `searchStrategy` other than "global"');
    }
}

function mergeOptions(moduleName, options) {
    validateOptions(options);
    const defaults = {
        moduleName,
        searchPlaces: getDefaultSearchPlaces(moduleName),
        ignoreEmptySearchPlaces: true,
        cache: true,
        transform: identity,
        loaders: defaultLoaders,
        metaConfigFilePath: null,
        mergeImportArrays: true,
        mergeSearchPlaces: true,
        searchStrategy: options.stopDir ? 'global' : 'none',
    };
    return mergeOptionsBase(moduleName, defaults, options);
}

function mergeOptionsSync(moduleName, options) {
    validateOptions(options);
    const defaults = {
        moduleName,
        searchPlaces: getDefaultSearchPlacesSync(moduleName),
        ignoreEmptySearchPlaces: true,
        cache: true,
        transform: identity,
        loaders: defaultLoadersSync,
        metaConfigFilePath: null,
        mergeImportArrays: true,
        mergeSearchPlaces: true,
        searchStrategy: options.stopDir ? 'global' : 'none',
    };
    return mergeOptionsBase(moduleName, defaults, options);
}

function cosmiconfig(moduleName, options = {}) {
    const normalizedOptions = mergeOptions(moduleName, options);
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
    const normalizedOptions = mergeOptionsSync(moduleName, options);
    const explorerSync = new ExplorerSync(normalizedOptions);

    return {
        search: explorerSync.search.bind(explorerSync),
        load: explorerSync.load.bind(explorerSync),
        clearLoadCache: explorerSync.clearLoadCache.bind(explorerSync),
        clearSearchCache: explorerSync.clearSearchCache.bind(explorerSync),
        clearCaches: explorerSync.clearCaches.bind(explorerSync)
    };
}

exports.cosmiconfig = cosmiconfig;
exports.cosmiconfigSync = cosmiconfigSync;
