"use strict";

// Import required modules and constants
const Stats_1 = require("./Stats");
const Dirent_1 = require("./Dirent");
const volume_1 = require("./volume");
const constants_1 = require("./constants");
const fsSynchronousApiList_1 = require("./node/lists/fsSynchronousApiList");
const fsCallbackApiList_1 = require("./node/lists/fsCallbackApiList");
const { F_OK, R_OK, W_OK, X_OK } = constants_1.constants;

// Export Volume class and create a default volume
exports.Volume = volume_1.Volume;
exports.vol = new volume_1.Volume();

// Function to create a file system object from a volume
function createFsFromVolume(vol) {
    const fs = {
        F_OK, R_OK, W_OK, X_OK, 
        constants: constants_1.constants, 
        Stats: Stats_1.default, 
        Dirent: Dirent_1.default
    };

    // Bind methods from the volume
    for (const method of fsSynchronousApiList_1.fsSynchronousApiList) {
        if (typeof vol[method] === 'function') {
            fs[method] = vol[method].bind(vol);
        }
    }
    for (const method of fsCallbackApiList_1.fsCallbackApiList) {
        if (typeof vol[method] === 'function') {
            fs[method] = vol[method].bind(vol);
        }
    }

    // Bind additional properties from the volume
    fs.StatWatcher = vol.StatWatcher;
    fs.FSWatcher = vol.FSWatcher;
    fs.WriteStream = vol.WriteStream;
    fs.ReadStream = vol.ReadStream;
    fs.promises = vol.promises;
    fs._toUnixTimestamp = volume_1.toUnixTimestamp;
    fs.__vol = vol;

    return fs;
}

// Export a file system created from the default volume
exports.fs = createFsFromVolume(exports.vol);

// Function to create a new in-memory file system
const memfs = (json = {}, cwd = '/') => {
    const vol = exports.Volume.fromNestedJSON(json, cwd);
    const fs = createFsFromVolume(vol);
    return { fs, vol };
};

// Export the memfs function
exports.memfs = memfs;

// Merge exports and set module properties
module.exports = { ...module.exports, ...exports.fs };
module.exports.semantic = true;
