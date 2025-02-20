'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault(ex) { 
    return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; 
}

const path = _interopDefault(require('path'));
const tsconfigPaths = require('tsconfig-paths');
const glob = require('glob');
const isGlob = _interopDefault(require('is-glob'));
const resolve = require('resolve').sync;
const debug = _interopDefault(require('debug'));

function __spreadArrays() {
    const s = Array.prototype.reduce.call(arguments, (acc, arr) => acc + arr.length, 0);
    const r = Array(s);
    let k = 0;
    Array.prototype.forEach.call(arguments, arr => {
        Array.prototype.forEach.call(arr, item => {
            r[k++] = item;
        });
    });
    return r;
}

const IMPORTER_NAME = 'eslint-import-resolver-typescript';
const log = debug(IMPORTER_NAME);

const defaultExtensions = ['.ts', '.tsx', '.d.ts'].concat(Object.keys(require.extensions), '.jsx');
const interfaceVersion = 2;

function resolve(source, file, options = {}) {
    log('looking for:', source);
    
    if (resolve.isCore(source)) {
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

    if ((/\.jsx?$/.test(foundNodePath) || (options.alwaysTryTypes && !foundNodePath)) &&
        !/^@types[/\\]/.test(source) && !path.isAbsolute(source) && !source.startsWith('.')) {
        const definitelyTyped = resolveModule('@types' + path.sep + mangleScopedPackage(source), file, options);
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
        return resolve(id, opts);
    } catch (error) {
        const idWithoutJsExt = removeJsExtension(id);
        return idWithoutJsExt !== id ? resolve(idWithoutJsExt, opts) : throw error;
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

const createExtendedMatchPath = function () {
    const createArgs = Array.from(arguments);
    const matchPath = tsconfigPaths.createMatchPath(...createArgs);
    return function (id) {
        const otherArgs = Array.from(arguments).slice(1);
        return matchPath(id, ...otherArgs) || matchPath(removeJsExtension(id), ...otherArgs);
    };
};

function initMappers(options) {
    if (mappers && mappersBuildForOptions === options) return;

    if (options.directory) {
        console.warn(`[${IMPORTER_NAME}]: option 'directory' is deprecated, please use 'project' instead`);
        if (!options.project) options.project = options.directory;
    }

    const configPaths = typeof options.project === 'string' ? [options.project] :
                        Array.isArray(options.project) ? options.project : [process.cwd()];

    mappers = configPaths
        .reduce((paths, p) => paths.concat(isGlob(p) ? glob.sync(p) : p), [])
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
        return replaceSlash !== moduleName ? replaceSlash.slice(1) : undefined;
    }
    return moduleName;
}

exports.interfaceVersion = interfaceVersion;
exports.resolve = resolve;
