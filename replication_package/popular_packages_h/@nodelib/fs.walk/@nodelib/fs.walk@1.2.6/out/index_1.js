"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = exports.walkStream = exports.walkSync = exports.walk = void 0;

const AsyncProvider = require("./providers/async").default;
const StreamProvider = require("./providers/stream").default;
const SyncProvider = require("./providers/sync").default;
const Settings = require("./settings").default;

exports.Settings = Settings;

/**
 * Walks through a directory asynchronously, either using default settings or provided options/settings.
 * @param {string} directory - The directory path to walk.
 * @param {object|function} optionsOrSettingsOrCallback - Options/settings or callback function.
 * @param {function} [callback] - Optional callback function if options/settings are provided.
 */
function walk(directory, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === 'function') {
        return new AsyncProvider(directory, resolveSettings()).read(optionsOrSettingsOrCallback);
    }
    new AsyncProvider(directory, resolveSettings(optionsOrSettingsOrCallback)).read(callback);
}
exports.walk = walk;

/**
 * Walks through a directory synchronously with provided options/settings.
 * @param {string} directory - The directory path to walk.
 * @param {object} [optionsOrSettings] - Options or settings for walking.
 * @returns {Array} - Returns an array of directory entries.
 */
function walkSync(directory, optionsOrSettings) {
    const settings = resolveSettings(optionsOrSettings);
    const provider = new SyncProvider(directory, settings);
    return provider.read();
}
exports.walkSync = walkSync;

/**
 * Streams entries from a directory based on options/settings.
 * @param {string} directory - The directory path to walk.
 * @param {object} [optionsOrSettings] - Options or settings for streaming.
 * @returns {Stream} - Returns a stream of directory entries.
 */
function walkStream(directory, optionsOrSettings) {
    const settings = resolveSettings(optionsOrSettings);
    const provider = new StreamProvider(directory, settings);
    return provider.read();
}
exports.walkStream = walkStream;

/**
 * Resolves settings or options to a Settings object.
 * @param {object} [settingsOrOptions] - The settings or options to resolve.
 * @returns {Settings} - Returns a Settings object.
 */
function resolveSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof Settings) {
        return settingsOrOptions;
    }
    return new Settings(settingsOrOptions);
}
