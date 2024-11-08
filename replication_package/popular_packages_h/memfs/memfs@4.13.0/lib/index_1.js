"use strict";

// Exporting various properties and default functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.memfs = exports.fs = exports.vol = exports.Volume = void 0;

// Importing related modules for file system operations
const Stats = require("./Stats");
const Dirent = require("./Dirent");
const { Volume, toUnixTimestamp } = require("./volume");
const { constants } = require("./constants");
const { fsSynchronousApiList } = require("./node/lists/fsSynchronousApiList");
const { fsCallbackApiList } = require("./node/lists/fsCallbackApiList");

// File system constants from the imported module
const { F_OK, R_OK, W_OK, X_OK } = constants;

// Export the Volume class
exports.Volume = Volume;

// Create a default volume instance
exports.vol = new Volume();

// Function to create a new file system from a given volume
function createFsFromVolume(vol) {
    const fs = {
        F_OK,
        R_OK,
        W_OK,
        X_OK,
        constants,
        Stats: Stats.default,
        Dirent: Dirent.default
    };

    // Bind volume methods to the fs object, ensuring the methods are functions
    for (const method of fsSynchronousApiList) {
        if (typeof vol[method] === 'function') {
            fs[method] = vol[method].bind(vol);
        }
    }
    
    for (const method of fsCallbackApiList) {
        if (typeof vol[method] === 'function') {
            fs[method] = vol[method].bind(vol);
        }
    }

    // Adding additional properties to the fs object
    fs.StatWatcher = vol.StatWatcher;
    fs.FSWatcher = vol.FSWatcher;
    fs.WriteStream = vol.WriteStream;
    fs.ReadStream = vol.ReadStream;
    fs.promises = vol.promises;
    fs._toUnixTimestamp = toUnixTimestamp;
    fs.__vol = vol;

    return fs;
}

// Export fs using the created volume
exports.fs = createFsFromVolume(exports.vol);

/**
 * Function to create a memfs instance based on a JSON structure
 *
 * @param {object} json - JSON object representing file system structure.
 * @param {string} cwd - The current working directory path.
 * @returns {object} - An object containing the fs and vol instances.
 */
const memfs = (json = {}, cwd = '/') => {
    const vol = Volume.fromNestedJSON(json, cwd);
    const fs = createFsFromVolume(vol);
    return { fs, vol };
};

// Export memfs function
exports.memfs = memfs;

// Module exports with additional properties
module.exports = { ...module.exports, ...exports.fs, semantic: true };
