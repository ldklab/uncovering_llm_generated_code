import fs from 'fs';
import path from 'path';

// Default loaders for file extensions, including handling of no extension.
const defaultLoaders = {
    '.json': JSON.parse,
    noExt: JSON.parse
};

export function lilconfig(appName, options = {}) {
    const {
        stopDir = '/',
        searchPlaces = [],
        ignoreEmptySearchPlaces = false,
        loaders = defaultLoaders
    } = options;

    // Asynchronous function to search for configuration files.
    async function search() {
        for (const searchPlace of searchPlaces) {
            const configPath = path.resolve(stopDir, searchPlace);
            if (!fs.existsSync(configPath)) continue;

            const content = await fs.promises.readFile(configPath, 'utf-8');
            if (!ignoreEmptySearchPlaces || content.trim() !== '') {
                const ext = path.extname(searchPlace) || 'noExt';
                const loader = loaders[ext] || loaders.noExt;
                return { config: loader(content), filepath: configPath };
            }
        }
        return null;
    }

    // Return an object with the search method.
    return { search };
}

export function lilconfigSync(appName, options = {}) {
    const {
        stopDir = '/',
        searchPlaces = [],
        ignoreEmptySearchPlaces = false,
        loaders = defaultLoaders
    } = options;

    // Synchronous function to load configuration files.
    function load(filepath) {
        const content = fs.readFileSync(filepath, 'utf-8');
        if (!ignoreEmptySearchPlaces || content.trim() !== '') {
            const ext = path.extname(filepath) || 'noExt';
            const loader = loaders[ext] || loaders.noExt;
            return { config: loader(content), filepath };
        }
        return null;
    }

    // Return an object with the load method.
    return { load };
}

// Example Usage
// import { lilconfig, lilconfigSync } from './lilconfig.js';
