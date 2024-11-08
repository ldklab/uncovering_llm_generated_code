"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");

const fsReadFileAsync = fs.promises.readFile;

function getDefaultSearchPlaces(name) {
    return [
        'package.json',
        `.${name}rc.json`,
        `.${name}rc.js`,
        `${name}.config.js`,
        `.${name}rc.cjs`,
        `${name}.config.cjs`
    ];
}

function getSearchPaths(startDir, stopDir) {
    return startDir.split(path.sep).reduceRight((acc, _, ind, arr) => {
        const currentPath = arr.slice(0, ind + 1).join(path.sep);
        if (!acc.passedStopDir) acc.searchPlaces.push(currentPath);
        if (currentPath === stopDir) acc.passedStopDir = true;
        return acc;
    }, { searchPlaces: [], passedStopDir: false }).searchPlaces;
}

const defaultLoaders = Object.freeze({
    '.js': require,
    '.json': require,
    '.cjs': require,
    noExt(_, content) { return JSON.parse(content); }
});
exports.defaultLoaders = defaultLoaders;

function getExtDesc(ext) {
    return ext === 'noExt' ? 'files without extensions' : `extension "${ext}"`;
}

function getOptions(name, options = {}) {
    const conf = {
        stopDir: os.homedir(),
        searchPlaces: getDefaultSearchPlaces(name),
        ignoreEmptySearchPlaces: true,
        transform: (x) => x,
        packageProp: [name],
        ...options,
        loaders: { ...defaultLoaders, ...options.loaders }
    };

    conf.searchPlaces.forEach(place => {
        const key = path.extname(place) || 'noExt';
        const loader = conf.loaders[key];
        if (!loader) throw new Error(`No loader specified for ${getExtDesc(key)}, so searchPlaces item "${place}" is invalid`);
        if (typeof loader !== 'function') throw new Error(`loader for ${getExtDesc(key)} is not a function (type provided: "${typeof loader}"), so searchPlaces item "${place}" is invalid`);
    });

    return conf;
}

function getPackageProp(props, obj) {
    if (typeof props === 'string' && props in obj) return obj[props];
    return ((Array.isArray(props) ? props : props.split('.')).reduce((o, prop) => (o ? o[prop] : undefined), obj) || null);
}

function getSearchItems(searchPlaces, searchPaths) {
    return searchPaths.reduce((items, searchPath) => {
        searchPlaces.forEach(fileName => items.push({
            fileName,
            filepath: path.join(searchPath, fileName),
            loaderKey: path.extname(fileName) || 'noExt',
        }));
        return items;
    }, []);
}

function validateFilePath(filepath) {
    if (!filepath) throw new Error('load must pass a non-empty string');
}

function validateLoader(loader, ext) {
    if (!loader) throw new Error(`No loader specified for extension "${ext}"`);
    if (typeof loader !== 'function') throw new Error('loader is not a function');
}

function lilconfig(name, options) {
    const { ignoreEmptySearchPlaces, loaders, packageProp, searchPlaces, stopDir, transform } = getOptions(name, options);

    return {
        async search(searchFrom = process.cwd()) {
            const searchPaths = getSearchPaths(searchFrom, stopDir);
            const searchItems = getSearchItems(searchPlaces, searchPaths);

            for (const { fileName, filepath, loaderKey } of searchItems) {
                try {
                    await fs.promises.access(filepath);
                } catch {
                    continue;
                }

                const content = String(await fsReadFileAsync(filepath));
                const loader = loaders[loaderKey];

                if (fileName === 'package.json') {
                    const pkg = loader(filepath, content);
                    const maybeConfig = getPackageProp(packageProp, pkg);
                    if (maybeConfig !== null) return transform({ config: maybeConfig, filepath });
                    continue;
                }

                const isEmpty = content.trim() === '';
                if (isEmpty && ignoreEmptySearchPlaces) continue;

                if (!isEmpty) validateLoader(loader, loaderKey);
                return transform({ config: isEmpty ? undefined : loader(filepath, content), filepath, isEmpty });
            }

            return transform(null);
        },
        
        async load(filepath) {
            validateFilePath(filepath);
            const { base, ext } = path.parse(filepath);
            const loaderKey = ext || 'noExt';
            const loader = loaders[loaderKey];
            validateLoader(loader, loaderKey);

            const content = String(await fsReadFileAsync(filepath));
            if (base === 'package.json') {
                const pkg = await loader(filepath, content);
                return transform({ config: getPackageProp(packageProp, pkg), filepath });
            }

            const isEmpty = content.trim() === '';
            return transform(isEmpty ? { config: undefined, filepath, isEmpty } : { config: loader(filepath, content), filepath });
        }
    };
}
exports.lilconfig = lilconfig;

function lilconfigSync(name, options) {
    const { ignoreEmptySearchPlaces, loaders, packageProp, searchPlaces, stopDir, transform } = getOptions(name, options);

    return {
        search(searchFrom = process.cwd()) {
            const searchPaths = getSearchPaths(searchFrom, stopDir);
            const searchItems = getSearchItems(searchPlaces, searchPaths);

            for (const { fileName, filepath, loaderKey } of searchItems) {
                try {
                    fs.accessSync(filepath);
                } catch {
                    continue;
                }

                const loader = loaders[loaderKey];
                const content = String(fs.readFileSync(filepath));

                if (fileName === 'package.json') {
                    const pkg = loader(filepath, content);
                    const maybeConfig = getPackageProp(packageProp, pkg);
                    if (maybeConfig !== null) return transform({ config: maybeConfig, filepath });
                    continue;
                }

                const isEmpty = content.trim() === '';
                if (isEmpty && ignoreEmptySearchPlaces) continue;

                if (!isEmpty) validateLoader(loader, loaderKey);
                return transform({ config: isEmpty ? undefined : loader(filepath, content), filepath, isEmpty });
            }

            return transform(null);
        },

        load(filepath) {
            validateFilePath(filepath);
            const { base, ext } = path.parse(filepath);
            const loaderKey = ext || 'noExt';
            const loader = loaders[loaderKey];
            validateLoader(loader, loaderKey);

            const content = String(fs.readFileSync(filepath));
            if (base === 'package.json') {
                const pkg = loader(filepath, content);
                return transform({ config: getPackageProp(packageProp, pkg), filepath });
            }

            const isEmpty = content.trim() === '';
            return transform(isEmpty ? { config: undefined, filepath, isEmpty } : { config: loader(filepath, content), filepath });
        }
    };
}
exports.lilconfigSync = lilconfigSync;
