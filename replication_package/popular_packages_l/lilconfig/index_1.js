// configLoader.js

import fs from 'fs';
import path from 'path';

const defaultLoaders = {
    '.json': JSON.parse,
    noExt: JSON.parse
};

export function createConfigLoader(appName, options = {}) {
    const {
        stopDir = '/',
        searchPlaces = [],
        ignoreEmptySearchPlaces = false,
        loaders = defaultLoaders
    } = options;

    async function findConfig() {
        for (const searchPlace of searchPlaces) {
            const configFilePath = path.resolve(stopDir, searchPlace);
            if (!fs.existsSync(configFilePath)) continue;

            const fileContent = await fs.promises.readFile(configFilePath, 'utf-8');
            if (!ignoreEmptySearchPlaces || fileContent.trim() !== '') {
                const extension = path.extname(searchPlace) || 'noExt';
                const configLoader = loaders[extension] || loaders.noExt;
                return { config: configLoader(fileContent), filepath: configFilePath };
            }
        }
        return null;
    }

    return { findConfig };
}

export function createConfigLoaderSync(appName, options = {}) {
    const {
        stopDir = '/',
        searchPlaces = [],
        ignoreEmptySearchPlaces = false,
        loaders = defaultLoaders
    } = options;

    function loadSync(filepath) {
        const fileContent = fs.readFileSync(filepath, 'utf-8');
        if (!ignoreEmptySearchPlaces || fileContent.trim() !== '') {
            const extension = path.extname(filepath) || 'noExt';
            const configLoader = loaders[extension] || loaders.noExt;
            return { config: configLoader(fileContent), filepath };
        }
        return null;
    }

    return { loadSync };
}

// Example Usage
// const { createConfigLoader, createConfigLoaderSync } = require('./configLoader.js');
// or if using ESModules: import { createConfigLoader, createConfigLoaderSync } from './configLoader.js';
