// Import necessary modules from Node.js
const path = require('path');
const fs = require('fs');
const os = require('os');

// Async version of fs.readFile
const fsReadFileAsync = fs.promises.readFile;

/**
 * Get default search locations for configuration files.
 * @param {string} name - Base name for configuration.
 * @param {boolean} sync - Whether to include .mjs files.
 * @returns {string[]} List of potential configuration file paths.
 */
function getDefaultSearchPlaces(name, sync) {
	return [
		'package.json', 
		`.${name}rc.json`, 
		`.${name}rc.js`, 
		`.${name}rc.cjs`,
		...(sync ? [] : [`.${name}rc.mjs`]), 
		`.config/${name}rc`, 
		`.config/${name}rc.json`, 
		`.config/${name}rc.js`, 
		`.config/${name}rc.cjs`,
		...(sync ? [] : [`.config/${name}rc.mjs`]), 
		`${name}.config.js`, 
		`${name}.config.cjs`, 
		...(sync ? [] : [`${name}.config.mjs`])
	];
}

/**
 * Get the parent directory of a given file path.
 * @param {string} p - File path.
 * @returns {string} Parent directory path.
 */
function parentDir(p) {
    return path.dirname(p) || path.sep; // Handle edge cases in Unix-like systems.
}

// JSON loader function
const jsonLoader = (_, content) => JSON.parse(content);

// Select require function appropriate for context (Node or Webpack)
const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;

// Synchronous loader methods
const defaultLoadersSync = Object.freeze({
    '.js': requireFunc,
    '.json': requireFunc,
    '.cjs': requireFunc,
    noExt: jsonLoader,
});

// Export synchronous loaders
module.exports.defaultLoadersSync = defaultLoadersSync;

// Dynamic import with fallback to require
const dynamicImport = async id => {
	try {
		const mod = await import(/* webpackIgnore: true */ id);
		return mod.default;
	} catch (e) {
		try {
			return requireFunc(id);
		} catch (requireE) {
			if (
				// Handle specific error cases for ESM syntax
				requireE.code === 'ERR_REQUIRE_ESM' ||
				(requireE instanceof SyntaxError && 
                requireE.toString().includes('Cannot use import statement outside a module'))
			) {
				throw e;
			}
			throw requireE;
		}
	}
};

// Asynchronous loader methods
const defaultLoaders = Object.freeze({
    '.js': dynamicImport,
    '.mjs': dynamicImport,
    '.cjs': dynamicImport,
    '.json': jsonLoader,
    noExt: jsonLoader,
});

// Export asynchronous loaders
module.exports.defaultLoaders = defaultLoaders;

/**
 * Compile and return configuration options with default settings.
 * @param {string} name - Configuration base name.
 * @param {object} options - Custom options.
 * @param {boolean} sync - Synchronous mode.
 * @returns {object} Complete configuration object.
 */
function getOptions(name, options, sync) {
    const conf = {
        stopDir: os.homedir(),
        searchPlaces: getDefaultSearchPlaces(name, sync),
        ignoreEmptySearchPlaces: true,
        cache: true,
        transform: x => x,
        packageProp: [name],
        ...options,
        loaders: {
            ...(sync ? defaultLoadersSync : defaultLoaders),
            ...options.loaders,
        },
    };

    // Validate loaders for each file extension
    conf.searchPlaces.forEach(place => {
        const key = path.extname(place) || 'noExt';
        const loader = conf.loaders[key];
        if (!loader) {
            throw new Error(`Missing loader for extension "${place}"`);
        }

        if (typeof loader !== 'function') {
            throw new Error(`Loader for extension "${place}" is not a function: Received ${typeof loader}.`);
        }
    });

    return conf;
}

/**
 * Extract property from an object based on either string or array keys.
 * @param {string | string[]} props - Keys specifying the property to extract.
 * @param {object} obj - Object to extract property from.
 * @returns {any} Value of the property or null.
 */
function getPackageProp(props, obj) {
    if (typeof props === 'string' && props in obj) return obj[props];
    return (
        (Array.isArray(props) ? props : props.split('.')).reduce(
            (acc, prop) => (acc === undefined ? acc : acc[prop]),
            obj,
        ) || null
    );
}

/**
 * Validate the given file path.
 * @param {string} filepath - Path to validate.
 * @throws Error if filepath is invalid.
 */
function validateFilePath(filepath) {
    if (!filepath) throw new Error('load must pass a non-empty string');
}

/**
 * Validate loader function for a file extension.
 * @param {function} loader - Loader function.
 * @param {string} ext - File extension.
 * @throws Error if loader is missing or not a function.
 */
function validateLoader(loader, ext) {
    if (!loader) throw new Error(`No loader specified for extension "${ext}"`);
    if (typeof loader !== 'function') throw new Error('loader is not a function');
}

/**
 * Create cache setter function depending on cache enablement.
 * @param {boolean} enableCache - Whether caching is enabled.
 * @returns {function} Cache setter function.
 */
const makeEmplace = enableCache => (cache, filepath, result) => {
    if (enableCache) cache.set(filepath, result);
    return result;
};

/**
 * Asynchronous configuration searching and loading.
 * @param {string} name - Configuration base name.
 * @param {object} options - Configuration options.
 * @returns {object} Functions for searching and loading configurations.
 */
module.exports.lilconfig = function lilconfig(name, options) {
    const {
        ignoreEmptySearchPlaces,
        loaders,
        packageProp,
        searchPlaces,
        stopDir,
        transform,
        cache,
    } = getOptions(name, options ?? {}, false);

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
                    const r = searchCache.get(dir);
                    if (r !== undefined) {
                        for (const p of visited) searchCache.set(p, r);
                        return r;
                    }
                    visited.add(dir);
                }

                for (const searchPlace of searchPlaces) {
                    const filepath = path.join(dir, searchPlace);
                    try {
                        await fs.promises.access(filepath);
                    } catch {
                        continue;
                    }
                    const content = String(await fsReadFileAsync(filepath));
                    const loaderKey = path.extname(searchPlace) || 'noExt';
                    const loader = loaders[loaderKey];

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

                    if (isEmpty) {
                        result.isEmpty = true;
                        result.config = undefined;
                    } else {
                        validateLoader(loader, loaderKey);
                        result.config = await loader(filepath, content);
                    }
                    result.filepath = filepath;
                    break dirLoop;
                }
                if (dir === stopDir || dir === parentDir(dir)) break dirLoop;
                dir = parentDir(dir);
            }

            const transformed = result.filepath === '' && result.config === null
                ? transform(null)
                : transform(result);

            if (cache) {
                for (const p of visited) searchCache.set(p, transformed);
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
                return emplace(
                    loadCache,
                    absPath,
                    transform({ config: getPackageProp(packageProp, pkg), filepath: absPath }),
                );
            }

            const result = { config: null, filepath: absPath };
            const isEmpty = content.trim() === '';
            if (isEmpty && ignoreEmptySearchPlaces)
                return emplace(
                    loadCache,
                    absPath,
                    transform({ config: undefined, filepath: absPath, isEmpty: true }),
                );

            result.config = isEmpty ? undefined : await loader(absPath, content);

            return emplace(
                loadCache,
                absPath,
                transform(isEmpty ? { ...result, isEmpty, config: undefined } : result),
            );
        },
        clearLoadCache() {
            if (cache) loadCache.clear();
        },
        clearSearchCache() {
            if (cache) searchCache.clear();
        },
        clearCaches() {
            if (cache) {
                loadCache.clear();
                searchCache.clear();
            }
        },
    };
};

/**
 * Synchronous configuration searching and loading.
 * @param {string} name - Configuration base name.
 * @param {object} options - Configuration options.
 * @returns {object} Functions for searching and loading configurations.
 */
module.exports.lilconfigSync = function lilconfigSync(name, options) {
    const {
        ignoreEmptySearchPlaces,
        loaders,
        packageProp,
        searchPlaces,
        stopDir,
        transform,
        cache,
    } = getOptions(name, options ?? {}, true);

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
                    const r = searchCache.get(dir);
                    if (r !== undefined) {
                        for (const p of visited) searchCache.set(p, r);
                        return r;
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

                    if (isEmpty) {
                        result.isEmpty = true;
                        result.config = undefined;
                    } else {
                        validateLoader(loader, loaderKey);
                        result.config = loader(filepath, content);
                    }
                    result.filepath = filepath;
                    break dirLoop;
                }
                if (dir === stopDir || dir === parentDir(dir)) break dirLoop;
                dir = parentDir(dir);
            }

            const transformed = result.filepath === '' && result.config === null
                ? transform(null)
                : transform(result);

            if (cache) {
                for (const p of visited) searchCache.set(p, transformed);
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
                return transform({ config: getPackageProp(packageProp, pkg), filepath: absPath });
            }

            const result = { config: null, filepath: absPath };
            const isEmpty = content.trim() === '';
            if (isEmpty && ignoreEmptySearchPlaces)
                return emplace(
                    loadCache,
                    absPath,
                    transform({ filepath: absPath, config: undefined, isEmpty: true }),
                );

            result.config = isEmpty ? undefined : loader(absPath, content);

            return emplace(
                loadCache,
                absPath,
                transform(isEmpty ? { ...result, isEmpty, config: undefined } : result),
            );
        },
        clearLoadCache() {
            if (cache) loadCache.clear();
        },
        clearSearchCache() {
            if (cache) searchCache.clear();
        },
        clearCaches() {
            if (cache) {
                loadCache.clear();
                searchCache.clear();
            }
        },
    };
};
