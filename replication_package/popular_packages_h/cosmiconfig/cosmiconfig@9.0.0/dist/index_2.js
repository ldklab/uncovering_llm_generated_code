"use strict";

// Export necessary functionalities
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLoadersSync = exports.defaultLoaders = exports.globalConfigSearchPlacesSync = exports.globalConfigSearchPlaces = exports.getDefaultSearchPlacesSync = exports.getDefaultSearchPlaces = exports.cosmiconfigSync = exports.cosmiconfig = void 0;

// Import functions and default settings from other modules
const { defaultLoaders, defaultLoadersSync, getDefaultSearchPlaces, getDefaultSearchPlacesSync, globalConfigSearchPlaces, globalConfigSearchPlacesSync, metaSearchPlaces } = require("./defaults");
const { Explorer } = require("./Explorer.js");
const { ExplorerSync } = require("./ExplorerSync.js");
const { removeUndefinedValuesFromObject } = require("./util");

// Identity function
const identity = x => x;

// Function to retrieve user-defined options from a meta-config
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
    
    if (metaConfig.config?.loaders) throw new Error('Can not specify loaders in meta config file');
    if (metaConfig.config?.searchStrategy) throw new Error('Can not specify searchStrategy in meta config file');
    
    const overrideOptions = {
        mergeSearchPlaces: true,
        ...metaConfig.config,
    };
    
    return {
        config: removeUndefinedValuesFromObject(overrideOptions),
        filepath: metaConfig.filepath,
    };
}

// Determine resolved search places based on configuration
function getResolvedSearchPlaces(moduleName, toolDefinedSearchPlaces, userConfiguredOptions) {
    const userConfiguredSearchPlaces = userConfiguredOptions.searchPlaces?.map(path => path.replace('{name}', moduleName));
    if (userConfiguredOptions.mergeSearchPlaces) {
        return [...(userConfiguredSearchPlaces ?? []), ...toolDefinedSearchPlaces];
    }
    return userConfiguredSearchPlaces ?? toolDefinedSearchPlaces;
}

// Base method for merging configuration options
function mergeOptionsBase(moduleName, defaults, options) {
    const userDefinedConfig = getUserDefinedOptionsFromMetaConfig();
    if (!userDefinedConfig) {
        return {
            ...defaults,
            ...removeUndefinedValuesFromObject(options),
            loaders: { ...defaults.loaders, ...options.loaders },
        };
    }
    
    const userConfiguredOptions = userDefinedConfig.config;
    return {
        ...defaults,
        ...removeUndefinedValuesFromObject(options),
        metaConfigFilePath: userDefinedConfig.filepath,
        ...userConfiguredOptions,
        searchPlaces: getResolvedSearchPlaces(moduleName, defaults.searchPlaces ?? options.searchPlaces, userConfiguredOptions),
        loaders: { ...defaults.loaders, ...options.loaders },
    };
}

// Validate options to check for conflicts
function validateOptions(options) {
    if (options.searchStrategy && options.searchStrategy !== 'global' && options.stopDir) {
        throw new Error('Can not supply `stopDir` option with `searchStrategy` other than "global"');
    }
}

// Main function to merge options for cosmiconfig
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

// Synchronous version of the merge options function
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

// Factory function to create an async cosmiconfig explorer
function cosmiconfig(moduleName, options = {}) {
    const normalizedOptions = mergeOptions(moduleName, options);
    const explorer = new Explorer(normalizedOptions);
    return {
        search: explorer.search.bind(explorer),
        load: explorer.load.bind(explorer),
        clearLoadCache: explorer.clearLoadCache.bind(explorer),
        clearSearchCache: explorer.clearSearchCache.bind(explorer),
        clearCaches: explorer.clearCaches.bind(explorer),
    };
}
exports.cosmiconfig = cosmiconfig;

// Factory function to create a sync cosmiconfig explorer
function cosmiconfigSync(moduleName, options = {}) {
    const normalizedOptions = mergeOptionsSync(moduleName, options);
    const explorerSync = new ExplorerSync(normalizedOptions);
    return {
        search: explorerSync.search.bind(explorerSync),
        load: explorerSync.load.bind(explorerSync),
        clearLoadCache: explorerSync.clearLoadCache.bind(explorerSync),
        clearSearchCache: explorerSync.clearSearchCache.bind(explorerSync),
        clearCaches: explorerSync.clearCaches.bind(explorerSync),
    };
}
exports.cosmiconfigSync = cosmiconfigSync;
