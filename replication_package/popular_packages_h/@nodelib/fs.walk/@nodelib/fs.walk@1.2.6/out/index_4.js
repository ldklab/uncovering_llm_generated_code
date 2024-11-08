"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = exports.walkStream = exports.walkSync = exports.walk = void 0;

const AsyncProvider = require("./providers/async").default;
const StreamProvider = require("./providers/stream").default;
const SyncProvider = require("./providers/sync").default;
const SettingsClass = require("./settings").default;

exports.Settings = SettingsClass;

function walk(directory, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === 'function') {
        const asyncProvider = new AsyncProvider(directory, resolveSettings());
        return asyncProvider.read(optionsOrSettingsOrCallback);
    }
    const asyncProvider = new AsyncProvider(directory, resolveSettings(optionsOrSettingsOrCallback));
    return asyncProvider.read(callback);
}
exports.walk = walk;

function walkSync(directory, optionsOrSettings) {
    const settings = resolveSettings(optionsOrSettings);
    const syncProvider = new SyncProvider(directory, settings);
    return syncProvider.read();
}
exports.walkSync = walkSync;

function walkStream(directory, optionsOrSettings) {
    const settings = resolveSettings(optionsOrSettings);
    const streamProvider = new StreamProvider(directory, settings);
    return streamProvider.read();
}
exports.walkStream = walkStream;

function resolveSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof SettingsClass) {
        return settingsOrOptions;
    }
    return new SettingsClass(settingsOrOptions);
}
