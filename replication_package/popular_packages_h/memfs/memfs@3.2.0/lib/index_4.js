"use strict";

const { Volume, toUnixTimestamp } = require("./volume");
const { fsSyncMethods, fsAsyncMethods } = require('fs-monkey/lib/util/lists');
const constants = require("./constants");
const Stats = require("./Stats").default;
const Dirent = require("./Dirent").default;

const F_OK = constants.constants.F_OK;
const R_OK = constants.constants.R_OK;
const W_OK = constants.constants.W_OK;
const X_OK = constants.constants.X_OK;

const vol = new Volume();

function createFsFromVolume(volume) {
    const fs = {
        F_OK,
        R_OK,
        W_OK,
        X_OK,
        constants: constants.constants,
        Stats,
        Dirent,
        _toUnixTimestamp: toUnixTimestamp,
        ...bindVolumeMethods(volume)
    };

    return fs;
}

function bindVolumeMethods(volume) {
    const methods = {};

    fsSyncMethods.forEach(method => {
        if (typeof volume[method] === 'function') {
            methods[method] = volume[method].bind(volume);
        }
    });

    fsAsyncMethods.forEach(method => {
        if (typeof volume[method] === 'function') {
            methods[method] = volume[method].bind(volume);
        }
    });

    ['StatWatcher', 'FSWatcher', 'WriteStream', 'ReadStream', 'promises'].forEach(property => {
        if (volume[property] !== undefined) {
            methods[property] = volume[property];
        }
    });

    return methods;
}

const fs = createFsFromVolume(vol);

module.exports = { ...module.exports, ...fs };
module.exports.semantic = true;

exports.Volume = Volume;
exports.vol = vol;
exports.createFsFromVolume = createFsFromVolume;
exports.fs = fs;
