// lilconfig.js

import fs from 'fs';
import path from 'path';

// Default loaders for configuration files
const defaultLoaders = {
    '.json': JSON.parse, // Loads JSON files
    noExt: JSON.parse    // Default to JSON parsing if no extension
};

// Asynchronous function to initiate the configuration search
export function lilconfig(appName, options = {}) {
    // Destructure options with defaults
    const {
        stopDir = '/',                   // Directory to start search
        searchPlaces = [],               // Array of paths to search for config
        ignoreEmptySearchPlaces = false, // Flag to ignore empty config files
        loaders = defaultLoaders         // Custom loaders for different file types
    } = options;

    // Asynchronous function to search for configuration files
    async function search() {
        for (const searchPlace of searchPlaces) {
            const configPath = path.resolve(stopDir, searchPlace);
            if (!fs.existsSync(configPath)) continue; // Skip if the path does not exist

            const content = await fs.promises.readFile(configPath, 'utf-8');
            if (!ignoreEmptySearchPlaces || content.trim() !== '') {
                const ext = path.extname(searchPlace) || 'noExt'; // Determine file extension
                const loader = loaders[ext] || loaders.noExt;     // Get appropriate loader
                return { config: loader(content), filepath: configPath }; // Return parsed config
            }
        }
        return null; // Return null if no valid config found
    }

    return { search };
}

// Synchronous function to initiate the configuration search
export function lilconfigSync(appName, options = {}) {
    // Destructure options with defaults
    const {
        stopDir = '/',                   // Directory to start search
        searchPlaces = [],               // Array of paths to search for config
        ignoreEmptySearchPlaces = false, // Flag to ignore empty config files
        loaders = defaultLoaders         // Custom loaders for different file types
    } = options;

    // Synchronous function to load a configuration file
    function load(filepath) {
        const content = fs.readFileSync(filepath, 'utf-8');
        if (!ignoreEmptySearchPlaces || content.trim() !== '') {
            const ext = path.extname(filepath) || 'noExt'; // Determine file extension
            const loader = loaders[ext] || loaders.noExt;  // Get appropriate loader
            return { config: loader(content), filepath };  // Return parsed config
        }
        return null; // Return null if no valid content found
    }

    return { load };
}

// Example Usage
// const { lilconfig, lilconfigSync } = require('./lilconfig.js');
// or if using ESModules: import { lilconfig, lilconfigSync } from './lilconfig.js';
