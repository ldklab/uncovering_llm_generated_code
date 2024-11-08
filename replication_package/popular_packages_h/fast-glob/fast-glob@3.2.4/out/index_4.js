"use strict";
const taskManager = require("./managers/tasks");
const AsyncProvider = require("./providers/async");
const StreamProvider = require("./providers/stream");
const SyncProvider = require("./providers/sync");
const Settings = require("./settings");
const utils = require("./utils");

async function FastGlob(source, options) {
    validatePatternsInput(source);
    const works = createWorkTasks(source, AsyncProvider, options);
    const results = await Promise.all(works);
    return utils.array.flatten(results);
}

const FastGlobExtended = function () {};

FastGlobExtended.sync = function sync(source, options) {
    validatePatternsInput(source);
    const works = createWorkTasks(source, SyncProvider, options);
    return utils.array.flatten(works);
};

FastGlobExtended.stream = function stream(source, options) {
    validatePatternsInput(source);
    const works = createWorkTasks(source, StreamProvider, options);
    return utils.stream.merge(works);
};

FastGlobExtended.generateTasks = function generateTasks(source, options) {
    validatePatternsInput(source);
    const patterns = Array.isArray(source) ? source : [source];
    const settings = new Settings(options);
    return taskManager.generate(patterns, settings);
};

FastGlobExtended.isDynamicPattern = function isDynamicPattern(source, options) {
    validatePatternsInput(source);
    const settings = new Settings(options);
    return utils.pattern.isDynamicPattern(source, settings);
};

FastGlobExtended.escapePath = function escapePath(source) {
    validatePatternsInput(source);
    return utils.path.escape(source);
};

function createWorkTasks(source, Provider, options) {
    const patterns = Array.isArray(source) ? source : [source];
    const settings = new Settings(options);
    const tasks = taskManager.generate(patterns, settings);
    const provider = new Provider(settings);
    return tasks.map(provider.read, provider);
}

function validatePatternsInput(input) {
    const source = Array.isArray(input) ? input : [input];
    const isValidSource = source.every(item => utils.string.isString(item) && !utils.string.isEmpty(item));
    if (!isValidSource) {
        throw new TypeError('Patterns must be a string (non-empty) or an array of strings');
    }
}

module.exports = Object.assign(FastGlob, FastGlobExtended);
