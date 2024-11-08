"use strict";
const { createFsFromVolume, Volume } = require('./volume');
const { constants } = require('./constants');
const Stats = require('./Stats').default;
const Dirent = require('./Dirent').default;
const fsSynchronousApiList = require('./node/lists/fsSynchronousApiList');
const fsCallbackApiList = require('./node/lists/fsCallbackApiList');

// Constants for file system access
const { F_OK, R_OK, W_OK, X_OK } = constants;

// Default volume configuration
const vol = new Volume();

/**
 * Converts a Volume instance into an `fs`-like module.
 *
 * @param {Volume} vol - The volume to create the `fs` module from.
 * @return {Object} The `fs`-like module.
 */
function createFsFromVolume(vol) {
    const fs = {
        F_OK, R_OK, W_OK, X_OK,
        constants,
        Stats,
        Dirent,
        StatWatcher: vol.StatWatcher,
        FSWatcher: vol.FSWatcher,
        WriteStream: vol.WriteStream,
        ReadStream: vol.ReadStream,
        promises: vol.promises,
        _toUnixTimestamp: require('./volume').toUnixTimestamp,
        __vol: vol
    };

    // Attach synchronous API methods
    fsSynchronousApiList.forEach(method => {
        if (typeof vol[method] === 'function') {
            fs[method] = vol[method].bind(vol);
        }
    });

    // Attach callback-based API methods
    fsCallbackApiList.forEach(method => {
        if (typeof vol[method] === 'function') {
            fs[method] = vol[method].bind(vol);
        }
    });

    return fs;
}

// Create the default `fs` module from the default volume
const fs = createFsFromVolume(vol);

/**
 * Creates a new file system instance from a JSON structure.
 *
 * @param {Object} json - The filesystem structure as a JSON object.
 * @param {string} [cwd='/'] - The current working directory.
 * @return {Object} An object containing the file system (`fs`) and volume (`vol`).
 */
function memfs(json = {}, cwd = '/') {
    const vol = Volume.fromNestedJSON(json, cwd);
    const fs = createFsFromVolume(vol);
    return { fs, vol };
}

module.exports = {
    memfs,
    vol,
    fs,
    createFsFromVolume,
    Volume,
    semantic: true
};
