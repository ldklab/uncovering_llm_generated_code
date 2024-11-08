"use strict";

const { fsSyncMethods, fsAsyncMethods } = require('fs-monkey/lib/util/lists');
const { Volume, toUnixTimestamp } = require("./volume");
const Stats = require("./Stats").default;
const Dirent = require("./Dirent").default;
const { constants } = require("./constants");

const { F_OK, R_OK, W_OK, X_OK } = constants;

// Export Volume and default volume instance
exports.Volume = Volume;
exports.vol = new Volume();

function createFsFromVolume(vol) {
    const fs = {
        F_OK,
        R_OK,
        W_OK,
        X_OK,
        constants,
        Stats,
        Dirent,
    };
    
    // Bind sync and async methods from volume to fs
    for (const method of fsSyncMethods) {
        if (typeof vol[method] === 'function') {
            fs[method] = vol[method].bind(vol);
        }
    }

    for (const method of fsAsyncMethods) {
        if (typeof vol[method] === 'function') {
            fs[method] = vol[method].bind(vol);
        }
    }
    
    // Attach additional volume specifics
    fs.StatWatcher = vol.StatWatcher;
    fs.FSWatcher = vol.FSWatcher;
    fs.WriteStream = vol.WriteStream;
    fs.ReadStream = vol.ReadStream;
    fs.promises = vol.promises;
    fs._toUnixTimestamp = toUnixTimestamp;
    
    return fs;
}

// Export created file system object
exports.createFsFromVolume = createFsFromVolume;
exports.fs = createFsFromVolume(exports.vol);

module.exports = {
    ...exports.fs,
    ...module.exports,
    semantic: true
};
