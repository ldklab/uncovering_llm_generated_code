"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { Volume, toUnixTimestamp } = require("./volume");
const Stats = require("./Stats").default;
const Dirent = require("./Dirent").default;
const { constants } = require("./constants");
const fsSynchronousApiList = require("./node/lists/fsSynchronousApiList");
const fsCallbackApiList = require("./node/lists/fsCallbackApiList");

const { F_OK, R_OK, W_OK, X_OK } = constants;

exports.Volume = Volume;
exports.vol = new Volume();

function createFsFromVolume(vol) {
    const fs = { 
        F_OK, R_OK, W_OK, X_OK, 
        constants, 
        Stats, 
        Dirent 
    };

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

    fs.StatWatcher = vol.StatWatcher;
    fs.FSWatcher = vol.FSWatcher;
    fs.WriteStream = vol.WriteStream;
    fs.ReadStream = vol.ReadStream;
    fs.promises = vol.promises;
    fs._toUnixTimestamp = toUnixTimestamp;
    fs.__vol = vol;

    return fs;
}

exports.fs = createFsFromVolume(exports.vol);

const memfs = (json = {}, cwd = '/') => {
    const vol = Volume.fromNestedJSON(json, cwd);
    return { 
        fs: createFsFromVolume(vol), 
        vol 
    };
};

exports.memfs = memfs;

module.exports = {
    ...module.exports,
    ...exports.fs,
    semantic: true
};
