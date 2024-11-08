"use strict";

// Utility function for merging objects
function __assign(target, ...sources) {
    sources.forEach(source => {
        for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    });
    return target;
}

Object.defineProperty(exports, "__esModule", { value: true });

const Stats = require("./Stats").default;
const Dirent = require("./Dirent").default;
const { Volume, toUnixTimestamp } = require("./volume");
const { fsSyncMethods, fsAsyncMethods } = require('fs-monkey/lib/util/lists');
const { constants } = require("./constants");

const { F_OK, R_OK, W_OK, X_OK } = constants;

// Exported entities
exports.Volume = Volume;
const vol = new Volume();
exports.vol = vol;

// Function to create an fs interface from a Volume
function createFsFromVolume(volume) {
    const fs = { 
        F_OK, R_OK, W_OK, X_OK, 
        constants, 
        Stats, 
        Dirent 
    };
    
    // Bind the synchronous methods
    fsSyncMethods.forEach(method => {
        if (typeof volume[method] === 'function') {
            fs[method] = volume[method].bind(volume);
        }
    });

    // Bind the asynchronous methods
    fsAsyncMethods.forEach(method => {
        if (typeof volume[method] === 'function') {
            fs[method] = volume[method].bind(volume);
        }
    });

    // Bind other properties
    fs.StatWatcher = volume.StatWatcher;
    fs.FSWatcher = volume.FSWatcher;
    fs.WriteStream = volume.WriteStream;
    fs.ReadStream = volume.ReadStream;
    fs.promises = volume.promises;
    fs._toUnixTimestamp = toUnixTimestamp;
    
    return fs;
}

exports.createFsFromVolume = createFsFromVolume;

// Create the default fs from the default volume and export
exports.fs = createFsFromVolume(vol);

// Extend module.exports with the fs interface
module.exports = __assign({}, module.exports, exports.fs);
module.exports.semantic = true;
