// @ts-check
const path = require('path');
const fs = require('fs');
const os = require('os');

const fsReadFileAsync = fs.promises.readFile;
const fsAccessAsync = fs.promises.access;

function getDefaultSearchPlaces(name, sync) {
    const basePlaces = [
        'package.json',
        `.${name}rc.json`,
        `.${name}rc.js`,
        `.${name}rc.cjs`,
        `.config/${name}rc`,
        `.config/${name}rc.json`,
        `.config/${name}rc.js`,
        `.config/${name}rc.cjs`,
        `${name}.config.js`,
        `${name}.config.cjs`
    ];
    if (!sync) {
        basePlaces.push(`.${name}rc.mjs`, `.config/${name}rc.mjs`, `${name}.config.mjs`);
    }
    return basePlaces;
}

function parentDir(p) {
    return path.dirname(p) || path.sep;
}

const jsonLoader = (_, content) => JSON.parse(content);
const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
const defaultLoadersSync = Object.freeze({
    '.js': requireFunc,
    '.json': requireFunc,
    '.cjs': requireFunc,
    noExt: jsonLoader,
});

async function dynamicImport(id) {
    try {
        const mod = await import(/* webpackIgnore: true */ id);
        return mod.default;
    } catch (e) {
        try {
            return requireFunc(id);
        } catch (requireE) {
            if (requireE.code === 'ERR_REQUIRE_ESM' || (requireE instanceof SyntaxError && requireE.toString().includes('Cannot use import statement outside a module'))) {
                throw e;
            }
            throw requireE;
        }
    }
}

const defaultLoaders = Object.freeze({
    '.js': dynamicImport,
    '.mjs': dynamicImport,
    '.cjs': dynamicImport,
    '.json': jsonLoader,
    noExt: jsonLoader,
});

function getOptions(name, options, sync) {
    const conf = {
        stopDir: os.homedir(),
        searchPlaces: getDefaultSearchPlaces(name, sync),
        ignoreEmptySearchPlaces: true,
        cache: true,
        transform: x => x,
        packageProp: [name],
        ...options,
        loaders: { ...(sync ? defaultLoadersSync : defaultLoaders), ...options.loaders },
    };
    conf.searchPlaces.forEach(place => {
        const key = path.extname(place) || 'noExt';
        const loader = conf.loaders[key];
        if (!loader) throw new Error(`Missing loader for extension "${place}"`);
        if (typeof loader !== 'function') throw new Error(`Loader for extension "${place}" is not a function`);
    });
    return conf;
}

function getPackageProp(props, obj) {
    const pathArray = Array.isArray(props) ? props : props.split('.');
    return pathArray.reduce((acc, prop) => (acc === undefined ? acc : acc[prop]), obj) || null;
}

function validateFilePath(filepath) {
    if (!filepath) throw new Error('load must pass a non-empty string');
}

function validateLoader(loader, ext) {
    if (!loader) throw new Error(`No loader specified for extension "${ext}"`);
    if (typeof loader !== 'function') throw new Error('loader is not a function');
}

const makeEmplace = enableCache => (cache, filepath, result) => {
    if (enableCache) cache.set(filepath, result);
    return result;
};

module.exports.lilconfig = function lilconfig(name, options) {
    const { ignoreEmptySearchPlaces, loaders, packageProp, searchPlaces, stopDir, transform, cache } = getOptions(name, options ?? {}, false);
    const searchCache = new Map();
    const loadCache = new Map();
    const emplace = makeEmplace(cache);

    return {
        async search(searchFrom = process.cwd()) {
            const result = { config: null, filepath: '' };
            const visited = new Set();
            let dir = searchFrom;

            dirLoop: while (true) {
                if (cache) {
                    const cachedResult = searchCache.get(dir);
                    if (cachedResult !== undefined) {
                        for (const path of visited) searchCache.set(path, cachedResult);
                        return cachedResult;
                    }
                    visited.add(dir);
                }

                for (const searchPlace of searchPlaces) {
                    const filepath = path.join(dir, searchPlace);
                    try {
                        await fsAccessAsync(filepath);
                    } catch {
                        continue;
                    }
                    const loaderKey = path.extname(searchPlace) || 'noExt';
                    const loader = loaders[loaderKey];
                    const content = String(await fsReadFileAsync(filepath));
                    
                    if (searchPlace === 'package.json') {
                        const pkg = await loader(filepath, content);
                        const maybeConfig = getPackageProp(packageProp, pkg);
                        if (maybeConfig != null) {
                            result.config = maybeConfig;
                            result.filepath = filepath;
                            break dirLoop;
                        }
                        continue;
                    }

                    const isEmpty = content.trim() === '';
                    if (isEmpty && ignoreEmptySearchPlaces) continue;

                    validateLoader(loader, loaderKey);
                    result.config = isEmpty ? undefined : await loader(filepath, content);
                    result.filepath = filepath;
                    if (!isEmpty) break dirLoop;
                }

                if (dir === stopDir || dir === parentDir(dir)) break dirLoop;
                dir = parentDir(dir);
            }

            const transformed = result.filepath === '' && result.config === null ? transform(null) : transform(result);

            if (cache) {
                for (const path of visited) searchCache.set(path, transformed);
            }

            return transformed;
        },

        async load(filepath) {
            validateFilePath(filepath);
            const absPath = path.resolve(process.cwd(), filepath);
            if (cache && loadCache.has(absPath)) {
                return loadCache.get(absPath);
            }

            const { base, ext } = path.parse(absPath);
            const loaderKey = ext || 'noExt';
            const loader = loaders[loaderKey];
            validateLoader(loader, loaderKey);

            const content = String(await fsReadFileAsync(absPath));
            if (base === 'package.json') {
                const pkg = await loader(absPath, content);
                return emplace(loadCache, absPath, transform({ config: getPackageProp(packageProp, pkg), filepath: absPath }));
            }

            const result = { config: null, filepath: absPath };
            const isEmpty = content.trim() === '';
            result.config = isEmpty ? undefined : await loader(absPath, content);
            return emplace(loadCache, absPath, transform(isEmpty ? { ...result, isEmpty, config: undefined } : result));
        },

        clearLoadCache() { if (cache) loadCache.clear(); },
        clearSearchCache() { if (cache) searchCache.clear(); },
        clearCaches() { if (cache) { loadCache.clear(); searchCache.clear(); } }
    };
};

module.exports.lilconfigSync = function lilconfigSync(name, options) {
    const { ignoreEmptySearchPlaces, loaders, packageProp, searchPlaces, stopDir, transform, cache } = getOptions(name, options ?? {}, true);
    const searchCache = new Map();
    const loadCache = new Map();
    const emplace = makeEmplace(cache);

    return {
        search(searchFrom = process.cwd()) {
            const result = { config: null, filepath: '' };
            const visited = new Set();
            let dir = searchFrom;

            dirLoop: while (true) {
                if (cache) {
                    const cachedResult = searchCache.get(dir);
                    if (cachedResult !== undefined) {
                        for (const path of visited) searchCache.set(path, cachedResult);
                        return cachedResult;
                    }
                    visited.add(dir);
                }

                for (const searchPlace of searchPlaces) {
                    const filepath = path.join(dir, searchPlace);
                    try {
                        fs.accessSync(filepath);
                    } catch {
                        continue;
                    }

                    const loaderKey = path.extname(searchPlace) || 'noExt';
                    const loader = loaders[loaderKey];
                    const content = String(fs.readFileSync(filepath));

                    if (searchPlace === 'package.json') {
                        const pkg = loader(filepath, content);
                        const maybeConfig = getPackageProp(packageProp, pkg);
                        if (maybeConfig != null) {
                            result.config = maybeConfig;
                            result.filepath = filepath;
                            break dirLoop;
                        }
                        continue;
                    }

                    const isEmpty = content.trim() === '';
                    if (isEmpty && ignoreEmptySearchPlaces) continue;

                    validateLoader(loader, loaderKey);
                    result.config = isEmpty ? undefined : loader(filepath, content);
                    result.filepath = filepath;
                    if (!isEmpty) break dirLoop;
                }

                if (dir === stopDir || dir === parentDir(dir)) break dirLoop;
                dir = parentDir(dir);
            }

            const transformed = result.filepath === '' && result.config === null ? transform(null) : transform(result);

            if (cache) {
                for (const path of visited) searchCache.set(path, transformed);
            }

            return transformed;
        },

        load(filepath) {
            validateFilePath(filepath);
            const absPath = path.resolve(process.cwd(), filepath);
            if (cache && loadCache.has(absPath)) {
                return loadCache.get(absPath);
            }

            const { base, ext } = path.parse(absPath);
            const loaderKey = ext || 'noExt';
            const loader = loaders[loaderKey];
            validateLoader(loader, loaderKey);

            const content = String(fs.readFileSync(absPath));
            if (base === 'package.json') {
                const pkg = loader(absPath, content);
                return emplace(loadCache, absPath, transform({ config: getPackageProp(packageProp, pkg), filepath: absPath }));
            }

            const result = { config: null, filepath: absPath };
            const isEmpty = content.trim() === '';
            result.config = isEmpty ? undefined : loader(absPath, content);
            return emplace(loadCache, absPath, transform(isEmpty ? { ...result, isEmpty, config: undefined } : result));
        },

        clearLoadCache() { if (cache) loadCache.clear(); },
        clearSearchCache() { if (cache) searchCache.clear(); },
        clearCaches() { if (cache) { loadCache.clear(); searchCache.clear(); } }
    };
};
