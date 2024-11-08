"use strict";
const taskManager = require("./managers/tasks");
const AsyncProvider = require("./providers/async");
const StreamProvider = require("./providers/stream");
const SyncProvider = require("./providers/sync");
const Settings = require("./settings");
const utils = require("./utils");

async function FastGlob(source, options) {
    assertPatternsInput(source);
    const works = getWorks(source, AsyncProvider, options);
    const result = await Promise.all(works);
    return utils.array.flatten(result);
}

(function (FastGlob) {
    FastGlob.sync = function (source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, SyncProvider, options);
        return utils.array.flatten(works);
    };

    FastGlob.stream = function (source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, StreamProvider, options);
        return utils.stream.merge(works);
    };

    FastGlob.generateTasks = function (source, options) {
        assertPatternsInput(source);
        const settings = new Settings(options);
        return taskManager.generate([].concat(source), settings);
    };

    FastGlob.isDynamicPattern = function (source, options) {
        assertPatternsInput(source);
        const settings = new Settings(options);
        return utils.pattern.isDynamicPattern(source, settings);
    };

    FastGlob.escapePath = function (source) {
        assertPatternsInput(source);
        return utils.path.escape(source);
    };
})(FastGlob || (FastGlob = {}));

function getWorks(source, Provider, options) {
    const settings = new Settings(options);
    const tasks = taskManager.generate([].concat(source), settings);
    const provider = new Provider(settings);
    return tasks.map(task => provider.read(task));
}

function assertPatternsInput(input) {
    const source = [].concat(input);
    if (!source.every(item => utils.string.isString(item) && !utils.string.isEmpty(item))) {
        throw new TypeError('Patterns must be a string (non empty) or an array of strings');
    }
}

module.exports = FastGlob;
