"use strict";

// Import necessary modules and utilities
const { Volume, toUnixTimestamp } = require("./volume");
const Stats = require("./Stats").default;
const Dirent = require("./Dirent").default;
const { fsSyncMethods, fsAsyncMethods } = require('fs-monkey/lib/util/lists');
const { constants: { F_OK, R_OK, W_OK, X_OK } } = require("./constants");

// Exportable Volume class
exports.Volume = Volume;

// Default Volume instance
const vol = new Volume();
exports.vol = vol;

// Function to create a filesystem-like interface from a given Volume
function createFsFromVolume(volumeInstance) {
    const fs = {
        F_OK,
        R_OK,
        W_OK,
        X_OK,
        constants: { F_OK, R_OK, W_OK, X_OK },
        Stats,
        Dirent
    };

    // Bind synchronous methods
    fsSyncMethods.forEach(method => {
        if (typeof volumeInstance[method] === 'function') {
            fs[method] = volumeInstance[method].bind(volumeInstance);
        }
    });

    // Bind asynchronous methods
    fsAsyncMethods.forEach(method => {
        if (typeof volumeInstance[method] === 'function') {
            fs[method] = volumeInstance[method].bind(volumeInstance);
        }
    });

    // Add additional properties
    fs.StatWatcher = volumeInstance.StatWatcher;
    fs.FSWatcher = volumeInstance.FSWatcher;
    fs.WriteStream = volumeInstance.WriteStream;
    fs.ReadStream = volumeInstance.ReadStream;
    fs.promises = volumeInstance.promises;
    fs._toUnixTimestamp = toUnixTimestamp;

    return fs;
}

// Create and export the fs object from the default volume
exports.createFsFromVolume = createFsFromVolume;
exports.fs = createFsFromVolume(vol);

// Extend module exports with the fs properties
module.exports = {
    ...module.exports,
    ...exports.fs,
    semantic: true
};
