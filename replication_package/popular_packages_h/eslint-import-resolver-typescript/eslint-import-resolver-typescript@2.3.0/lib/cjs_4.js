'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const path = require('path');
const tsconfigPaths = require('tsconfig-paths');
const glob = require('glob');
const isGlob = require('is-glob');
const resolve$1 = require('resolve');
const debug = require('debug');

function __spreadArrays() {
    return Array.prototype.concat.apply([], arguments);
}

const IMPORTER_NAME = 'eslint-import-resolver-typescript';
const log = debug(IMPORTER_NAME);
const defaultExtensions = ['.ts', '.tsx', '.d.ts', ...Object.keys(require.extensions), '.jsx'];
const interfaceVersion = 2;

function resolve(source, file, options = {}) {
    log('looking for:', source);

    if (resolve$1.isCore(source)) {
        log('matched core:', source);
        return { found: true, path: null };
    }

    initMappers(options);
    const mappedPath = getMappedPath(source, file);

    if (mappedPath) {
        log('matched ts path:', mappedPath);
    }

    let foundNodePath;
    try {
        foundNodePath = tsResolve(mappedPath || source, {
            extensions: options.extensions || defaultExtensions,
            basedir: path.dirname(path.resolve(file)),
            packageFilter: options.packageFilter || packageFilterDefault,
        });
    } catch {
        foundNodePath = null;
    }

    if (/\.jsx?$/.test(foundNodePath) || (options.alwaysTryTypes && !foundNodePath) && 
        !/^@types[/\\]/.test(source) && !path.isAbsolute(source) && !source.startsWith('.')) {
        
        const definitelyTyped = resolve('@types' + path.sep + mangleScopedPackage(source), file, options);
        if (definitelyTyped.found) {
            return definitelyTyped;
        }
    }

    if (foundNodePath) {
        log('matched node path:', foundNodePath);
        return { found: true, path: foundNodePath };
    }

    log("didn't find ", source);
    return { found: false };
}

function packageFilterDefault(pkg) {
    pkg.main = pkg.types || pkg.typings || pkg.module || pkg['jsnext:main'] || pkg.main;
    return pkg;
}

function tsResolve(id, opts) {
    try {
        return resolve$1.sync(id, opts);
    } catch (error) {
        const idWithoutJsExt = removeJsExtension(id);
        if (idWithoutJsExt !== id) {
            return resolve$1.sync(idWithoutJsExt, opts);
        }
        throw error;
    }
}

function removeJsExtension(id) {
    return id.replace(/\.jsx?$/, '');
}

let mappersBuildForOptions;
let mappers;

function getMappedPath(source, file) {
    const paths = mappers.map(mapper => mapper(source, file)).filter(Boolean);
    if (paths.length > 1) {
        log('found multiple matching ts paths:', paths);
    }
    return paths[0];
}

const createExtendedMatchPath = (...createArgs) => {
    const matchPath = tsconfigPaths.createMatchPath(...createArgs);
    return (id, ...otherArgs) => {
        let match = matchPath(id, ...otherArgs);
        if (match != null) return match;

        const idWithoutJsExt = removeJsExtension(id);
        if (idWithoutJsExt !== id) {
            return matchPath(idWithoutJsExt, ...otherArgs);
        }
    };
};

function initMappers(options) {
    if (mappers && mappersBuildForOptions === options) return;

    if (options.directory) {
        console.warn(`[${IMPORTER_NAME}]: option 'directory' is deprecated, please use 'project' instead`);
        if (!options.project) {
            options.project = options.directory;
        }
    }

    const configPaths = typeof options.project === 'string'
        ? [options.project]
        : Array.isArray(options.project)
            ? options.project
            : [process.cwd()];

    mappers = configPaths
        .reduce((paths, path) => paths.concat(isGlob(path) ? glob.sync(path) : path), [])
        .map(tsconfigPaths.loadConfig)
        .filter(isConfigLoaderSuccessResult)
        .map(configLoaderResult => {
            const matchPath = createExtendedMatchPath(configLoaderResult.absoluteBaseUrl, configLoaderResult.paths);
            return (source, file) => {
                if (!file.includes(configLoaderResult.absoluteBaseUrl)) return;
                return matchPath(source, undefined, undefined, options.extensions || defaultExtensions);
            };
        });

    mappersBuildForOptions = options;
}

function isConfigLoaderSuccessResult(configLoaderResult) {
    if (configLoaderResult.resultType !== 'success') {
        log('failed to init tsconfig-paths:', configLoaderResult.message);
        return false;
    }
    return true;
}

function mangleScopedPackage(moduleName) {
    if (moduleName.startsWith('@')) {
        const replaceSlash = moduleName.replace(path.sep, '__');
        if (replaceSlash !== moduleName) {
            return replaceSlash.slice(1);
        }
    }
    return moduleName;
}

exports.interfaceVersion = interfaceVersion;
exports.resolve = resolve;
