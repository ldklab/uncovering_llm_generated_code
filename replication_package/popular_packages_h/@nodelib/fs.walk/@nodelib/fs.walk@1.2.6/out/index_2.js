"use strict";
const asyncProvider = require("./providers/async").default;
const syncProvider = require("./providers/sync").default;
const streamProvider = require("./providers/stream").default;
const SettingsModule = require("./settings").default;

function getSettings(settingsOrOptions = {}) {
    return settingsOrOptions instanceof SettingsModule ? settingsOrOptions : new SettingsModule(settingsOrOptions);
}

function walk(directory, optionsOrSettingsOrCallback, callback) {
    const asyncWalker = new asyncProvider(directory, getSettings(optionsOrSettingsOrCallback));
    if (typeof optionsOrSettingsOrCallback === 'function') {
        return asyncWalker.read(optionsOrSettingsOrCallback);
    }
    asyncWalker.read(callback);
}

function walkSync(directory, optionsOrSettings) {
    const syncWalker = new syncProvider(directory, getSettings(optionsOrSettings));
    return syncWalker.read();
}

function walkStream(directory, optionsOrSettings) {
    const streamWalker = new streamProvider(directory, getSettings(optionsOrSettings));
    return streamWalker.read();
}

exports.Settings = SettingsModule;
exports.walk = walk;
exports.walkSync = walkSync;
exports.walkStream = walkStream;
