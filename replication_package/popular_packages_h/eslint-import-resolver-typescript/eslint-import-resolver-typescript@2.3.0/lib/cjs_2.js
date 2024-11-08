'use strict';

const path = require('path');
const tsconfigPaths = require('tsconfig-paths');
const glob = require('glob');
const isGlob = require('is-glob');
const resolve$1 = require('resolve');
const debug = require('debug')('eslint-import-resolver-typescript');

function __spreadArrays() {
    return Array.prototype.concat.apply([], arguments);
}

const defaultExtensions = ['.ts', '.tsx', '.d.ts', ...Object.keys(require.extensions), '.jsx'];

function resolve(source, file, options = {}) {
    const log = debug;
    log('looking for:', source);
    
    if (resolve$1.isCore(source)) {
        log('matched core:', source);
        return { found: true, path: null };
    }
    
    initMappers(options);
    const mappedPath = getMappedPath(source, file);
    if (mappedPath) log('matched ts path:', mappedPath);

    let foundNodePath = tryResolve(mappedPath || source, getResolverOptions(file, options));
    if (foundNodePath || !isEligibleForTypesResolution(source, foundNodePath, options)) return pathResult(log, foundNodePath, source);

    const typesPath = resolveTypes(source, file, options);
    return typesPath.found ? typesPath : pathResult(log, foundNodePath, source);
}

function tryResolve(id, opts) {
    try {
        return resolve$1.sync(id, opts);
    } catch (error) {
        const idWithoutJsExt = removeJsExtension(id);
        if (idWithoutJsExt !== id) {
            return resolve$1.sync(idWithoutJsExt, opts);
        }
    }
    return null;
}

function removeJsExtension(id) {
    return id.replace(/\.jsx?$/, '');
}

function getResolverOptions(file, options) {
    return {
        extensions: options.extensions || defaultExtensions,
        basedir: path.dirname(path.resolve(file)),
        packageFilter: options.packageFilter || packageFilterDefault
    };
}

function packageFilterDefault(pkg) {
    pkg.main = pkg.types || pkg.typings || pkg.module || pkg['jsnext:main'] || pkg.main;
    return pkg;
}

function isEligibleForTypesResolution(source, foundNodePath, options) {
    return (/\.jsx?$/.test(foundNodePath) || (options.alwaysTryTypes && !foundNodePath)) && !/^@types[/\\]/.test(source) && !path.isAbsolute(source) && !source.startsWith('.');
}

function resolveTypes(source, file, options) {
    return resolve('@types' + path.sep + mangleScopedPackage(source), file, options);
}

function pathResult(log, foundNodePath, source) {
    if (foundNodePath) {
        log('matched node path:', foundNodePath);
        return { found: true, path: foundNodePath };
    }
    log("didn't find ", source);
    return { found: false };
}

let mappers, mappersBuildForOptions;

function initMappers(options) {
    if (mappers && mappersBuildForOptions === options) return;

    handleDeprecatedOptions(options);
    
    const configPaths = getConfigPaths(options);
    mappers = configPaths
        .reduce((paths, configPath) => paths.concat(resolveGlob(configPath)), [])
        .map(tsconfigPaths.loadConfig)
        .filter(isConfigLoaderSuccessResult)
        .map(createMapper.bind(null, options));
    
    mappersBuildForOptions = options;
}

function handleDeprecatedOptions(options) {
    if (options.directory) {
        console.warn(`[${debug.namespace}]: option 'directory' is deprecated, please use 'project' instead`);
        options.project = options.project || options.directory;
    }
}

function getConfigPaths(options) {
    return typeof options.project === 'string' ? [options.project] : Array.isArray(options.project) ? options.project : [process.cwd()];
}

function resolveGlob(configPath) {
    return isGlob(configPath) ? glob.sync(configPath) : configPath;
}

function isConfigLoaderSuccessResult(configLoaderResult) {
    if (configLoaderResult.resultType !== 'success') {
        debug('failed to init tsconfig-paths:', configLoaderResult.message);
        return false;
    }
    return true;
}

function createMapper(options, configLoaderResult) {
    const matchPath = createExtendedMatchPath(configLoaderResult.absoluteBaseUrl, configLoaderResult.paths);
    return (source, file) => {
        if (!file.includes(configLoaderResult.absoluteBaseUrl)) return;
        return matchPath(source, undefined, undefined, options.extensions || defaultExtensions);
    };
}

function createExtendedMatchPath() {
    const matchPathArgs = arguments;
    const matchPath = tsconfigPaths.createMatchPath(...matchPathArgs);
    
    return (id, ...otherArgs) => {
        const match = matchPath(id, ...otherArgs);
        if (match != null) return match;

        const idWithoutJsExt = removeJsExtension(id);
        return idWithoutJsExt !== id ? matchPath(idWithoutJsExt, ...otherArgs) : null;
    };
}

function mangleScopedPackage(moduleName) {
    if (moduleName.startsWith('@')) {
        const replaceSlash = moduleName.replace(path.sep, '__');
        if (replaceSlash !== moduleName) return replaceSlash.slice(1);
    }
    return moduleName;
}

module.exports = { interfaceVersion: 2, resolve };
