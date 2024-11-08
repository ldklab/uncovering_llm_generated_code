"use strict";

const taskManager = require("./managers/tasks");
const asyncProvider = require("./providers/async").default;
const streamProvider = require("./providers/stream").default;
const syncProvider = require("./providers/sync").default;
const Settings = require("./settings").default;
const utils = require("./utils");

async function FastGlob(source, options) {
    validatePatterns(source);
    const tasks = prepareTasks(source, asyncProvider, options);
    const results = await Promise.all(tasks);
    return utils.array.flatten(results);
}

(function (FastGlob) {
    FastGlob.sync = function sync(source, options) {
        validatePatterns(source);
        const tasks = prepareTasks(source, syncProvider, options);
        return utils.array.flatten(tasks);
    };

    FastGlob.stream = function stream(source, options) {
        validatePatterns(source);
        const tasks = prepareTasks(source, streamProvider, options);
        return utils.stream.merge(tasks);
    };

    FastGlob.generateTasks = function generateTasks(source, options) {
        validatePatterns(source);
        const settings = new Settings(options);
        return taskManager.generate([].concat(source), settings);
    };

    FastGlob.isDynamicPattern = function isDynamicPattern(source, options) {
        validatePatterns(source);
        const settings = new Settings(options);
        return utils.pattern.isDynamicPattern(source, settings);
    };

    FastGlob.escapePath = function escapePath(source) {
        validatePatterns(source);
        return utils.path.escape(source);
    };
})(FastGlob || (FastGlob = {}));

function prepareTasks(source, Provider, options) {
    const settings = new Settings(options);
    const tasks = taskManager.generate([].concat(source), settings);
    const provider = new Provider(settings);
    return tasks.map(provider.read, provider);
}

function validatePatterns(input) {
    const sourceArray = [].concat(input);
    const isValid = sourceArray.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));
    if (!isValid) {
        throw new TypeError('Patterns must be a string (non empty) or an array of strings');
    }
}

module.exports = FastGlob;
