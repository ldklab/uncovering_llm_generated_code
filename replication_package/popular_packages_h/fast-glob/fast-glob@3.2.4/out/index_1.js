"use strict";

const taskManager = require("./managers/tasks");
const AsyncProvider = require("./providers/async").default;
const StreamProvider = require("./providers/stream").default;
const SyncProvider = require("./providers/sync").default;
const Settings = require("./settings").default;
const utils = require("./utils");

async function FastGlob(source, options) {
    assertPatternsInput(source);
    const works = getWorks(source, AsyncProvider, options);
    const result = await Promise.all(works);
    return utils.array.flatten(result);
}

(function (FastGlob) {
    FastGlob.sync = function sync(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, SyncProvider, options);
        return utils.array.flatten(works);
    };

    FastGlob.stream = function stream(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, StreamProvider, options);
        return utils.stream.merge(works);
    };

    FastGlob.generateTasks = function generateTasks(source, options) {
        assertPatternsInput(source);
        const patterns = [].concat(source);
        const settings = new Settings(options);
        return taskManager.generate(patterns, settings);
    };

    FastGlob.isDynamicPattern = function isDynamicPattern(source, options) {
        assertPatternsInput(source);
        const settings = new Settings(options);
        return utils.pattern.isDynamicPattern(source, settings);
    };

    FastGlob.escapePath = function escapePath(source) {
        assertPatternsInput(source);
        return utils.path.escape(source);
    };

})(FastGlob || (FastGlob = {}));

function getWorks(source, Provider, options) {
    const patterns = [].concat(source);
    const settings = new Settings(options);
    const tasks = taskManager.generate(patterns, settings);
    const provider = new Provider(settings);
    return tasks.map(provider.read, provider);
}

function assertPatternsInput(input) {
    const source = [].concat(input);
    const isValidSource = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));
    if (!isValidSource) {
        throw new TypeError('Patterns must be a string (non empty) or an array of strings');
    }
}

module.exports = FastGlob;
