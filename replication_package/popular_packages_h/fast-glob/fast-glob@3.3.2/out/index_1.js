"use strict";

const taskManager = require("./managers/tasks");
const AsyncProvider = require("./providers/async");
const StreamProvider = require("./providers/stream");
const SyncProvider = require("./providers/sync");
const Settings = require("./settings");
const utils = require("./utils");

async function FastGlob(source, options) {
    validatePatternsInput(source);
    const tasks = getTasks(source, AsyncProvider, options);
    const results = await Promise.all(tasks);
    return utils.array.flatten(results);
}

(function (FastGlob) {
    FastGlob.glob = FastGlob;
    FastGlob.globSync = sync;
    FastGlob.globStream = stream;
    FastGlob.async = FastGlob;

    function sync(source, options) {
        validatePatternsInput(source);
        const tasks = getTasks(source, SyncProvider, options);
        return utils.array.flatten(tasks);
    }
    FastGlob.sync = sync;

    function stream(source, options) {
        validatePatternsInput(source);
        const tasks = getTasks(source, StreamProvider, options);
        return utils.stream.merge(tasks);
    }
    FastGlob.stream = stream;

    function generateTasks(source, options) {
        validatePatternsInput(source);
        const patterns = [].concat(source);
        const settings = new Settings(options);
        return taskManager.generate(patterns, settings);
    }
    FastGlob.generateTasks = generateTasks;

    function isDynamicPattern(source, options) {
        validatePatternsInput(source);
        const settings = new Settings(options);
        return utils.pattern.isDynamicPattern(source, settings);
    }
    FastGlob.isDynamicPattern = isDynamicPattern;

    function escapePath(source) {
        validatePatternsInput(source);
        return utils.path.escape(source);
    }
    FastGlob.escapePath = escapePath;

    function convertPathToPattern(source) {
        validatePatternsInput(source);
        return utils.path.convertPathToPattern(source);
    }
    FastGlob.convertPathToPattern = convertPathToPattern;

    let posix;
    (function (posix) {
        function escapePath(source) {
            validatePatternsInput(source);
            return utils.path.escapePosixPath(source);
        }
        posix.escapePath = escapePath;

        function convertPathToPattern(source) {
            validatePatternsInput(source);
            return utils.path.convertPosixPathToPattern(source);
        }
        posix.convertPathToPattern = convertPathToPattern;
    })(posix = FastGlob.posix || (FastGlob.posix = {}));

    let win32;
    (function (win32) {
        function escapePath(source) {
            validatePatternsInput(source);
            return utils.path.escapeWindowsPath(source);
        }
        win32.escapePath = escapePath;

        function convertPathToPattern(source) {
            validatePatternsInput(source);
            return utils.path.convertWindowsPathToPattern(source);
        }
        win32.convertPathToPattern = convertPathToPattern;
    })(win32 = FastGlob.win32 || (FastGlob.win32 = {}));
})(FastGlob || (FastGlob = {}));

function getTasks(source, Provider, options) {
    const patterns = [].concat(source);
    const settings = new Settings(options);
    const tasks = taskManager.generate(patterns, settings);
    const provider = new Provider(settings);
    return tasks.map(provider.read, provider);
}

function validatePatternsInput(input) {
    const source = [].concat(input);
    const isValid = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));
    if (!isValid) {
        throw new TypeError('Patterns must be a string (non empty) or an array of strings');
    }
}

module.exports = FastGlob;
