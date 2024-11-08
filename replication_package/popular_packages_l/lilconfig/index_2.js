// lilconfig.js

import fs from 'fs';
import path from 'path';

/**
 * Default loader functions for different file extensions.
 * Assuming JSON parser for files with .json extension and files with no extension.
 */
const defaultLoaders = {
    '.json': JSON.parse,
    noExt: JSON.parse
};

/**
 * Asynchronous configuration loader function.
 * @param {string} appName - Application name to be used in some way in the future.
 * @param {object} options - Configuration options.
 * @returns {object} Contains a search function to find and load the configuration.
 */
export function lilconfig(appName, options = {}) {
    const {
        stopDir = '/',  // Directory to stop searching at
        searchPlaces = [],  // List of filenames to search for
        ignoreEmptySearchPlaces = false,  // Flag to ignore empty config files
        loaders = defaultLoaders  // Custom loaders, falling back on defaults
    } = options;

    /**
     * Asynchronously search for configuration files and load their content.
     * @returns {object|null} Config object and filepath or null if not found.
     */
    async function search() {
        for (const searchPlace of searchPlaces) {
            // Construct the potential config path
            const configPath = path.resolve(stopDir, searchPlace);
            if (!fs.existsSync(configPath)) continue; // Skip if it doesn't exist

            // Read the file content asynchronously
            const content = await fs.promises.readFile(configPath, 'utf-8');
            if (!ignoreEmptySearchPlaces || content.trim() !== '') {
                const ext = path.extname(searchPlace) || 'noExt';  // Determine file extension
                const loader = loaders[ext] || loaders.noExt;  // Select an appropriate loader
                return { config: loader(content), filepath: configPath };  // Return loaded config
            }
        }
        return null;  // Return null if no configuration found
    }

    return { search };
}

/**
 * Synchronous configuration loader function.
 * @param {string} appName - Application name to be used in some way in the future.
 * @param {object} options - Configuration options.
 * @returns {object} Contains a load function to find and load the configuration.
 */
export function lilconfigSync(appName, options = {}) {
    const {
        stopDir = '/',  // Directory to stop searching at
        searchPlaces = [],  // List of filenames to search for
        ignoreEmptySearchPlaces = false,  // Flag to ignore empty config files
        loaders = defaultLoaders  // Custom loaders, falling back on defaults
    } = options;

    /**
     * Synchronously load configuration from a specified filepath.
     * @param {string} filepath - Path to the configuration file.
     * @returns {object|null} Loaded configuration object or null if empty.
     */
    function load(filepath) {
        const content = fs.readFileSync(filepath, 'utf-8');  // Read content synchronously
        if (!ignoreEmptySearchPlaces || content.trim() !== '') {
            const ext = path.extname(filepath) || 'noExt';  // Determine file extension
            const loader = loaders[ext] || loaders.noExt;  // Select an appropriate loader
            return { config: loader(content), filepath };  // Return loaded config
        }
        return null;  // Return null if the file is empty
    }

    return { load };
}

// Example Usage
// const { lilconfig, lilconfigSync } = require('./lilconfig.js');
// or if using ESModules: import { lilconfig, lilconfigSync } from './lilconfig.js';
