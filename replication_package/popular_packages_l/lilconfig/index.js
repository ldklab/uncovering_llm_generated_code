// lilconfig.js

import fs from 'fs';
import path from 'path';

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

    return { search };
}

export function lilconfigSync(appName, options = {}) {
    const {
        stopDir = '/',
        searchPlaces = [],
        ignoreEmptySearchPlaces = false,
        loaders = defaultLoaders
    } = options;

    function load(filepath) {
        const content = fs.readFileSync(filepath, 'utf-8');
        if (!ignoreEmptySearchPlaces || content.trim() !== '') {
            const ext = path.extname(filepath) || 'noExt';
            const loader = loaders[ext] || loaders.noExt;
            return { config: loader(content), filepath };
        }
        return null;
    }

    return { load };
}

// Example Usage
// const { lilconfig, lilconfigSync } = require('./lilconfig.js');
// or if using ESModules: import { lilconfig, lilconfigSync } from './lilconfig.js';
