"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = exports.walkStream = exports.walkSync = exports.walk = void 0;

const asyncProvider = require("./providers/async");
const streamProvider = require("./providers/stream");
const syncProvider = require("./providers/sync");
const Settings = require("./settings").default;

exports.Settings = Settings;

function walk(directory, optsOrSettingsOrCb, cb) {
    if (typeof optsOrSettingsOrCb === 'function') {
        const settings = getSettings();
        const provider = new asyncProvider.default(directory, settings);
        return provider.read(optsOrSettingsOrCb);
    }

    const settings = getSettings(optsOrSettingsOrCb);
    const provider = new asyncProvider.default(directory, settings);
    provider.read(cb);
}

exports.walk = walk;

function walkSync(directory, optsOrSettings) {
    const settings = getSettings(optsOrSettings);
    const provider = new syncProvider.default(directory, settings);
    return provider.read();
}

exports.walkSync = walkSync;

function walkStream(directory, optsOrSettings) {
    const settings = getSettings(optsOrSettings);
    const provider = new streamProvider.default(directory, settings);
    return provider.read();
}

exports.walkStream = walkStream;

function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof Settings) {
        return settingsOrOptions;
    }
    return new Settings(settingsOrOptions);
}
