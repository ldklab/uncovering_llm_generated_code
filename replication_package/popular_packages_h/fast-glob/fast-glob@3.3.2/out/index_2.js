"use strict";

const taskManager = require("./managers/tasks");
const AsyncProvider = require("./providers/async").default;
const StreamProvider = require("./providers/stream").default;
const SyncProvider = require("./providers/sync").default;
const Settings = require("./settings").default;
const utils = require("./utils");

async function FastGlob(source, options) {
    validateInput(source);
    const works = executeTasks(source, AsyncProvider, options);
    const result = await Promise.all(works);
    return utils.array.flatten(result);
}

(function (FastGlob) {
    FastGlob.glob = FastGlob;
    FastGlob.globSync = sync;
    FastGlob.globStream = stream;
    FastGlob.async = FastGlob;

    function sync(source, options) {
        validateInput(source);
        const works = executeTasks(source, SyncProvider, options);
        return utils.array.flatten(works);
    }
    FastGlob.sync = sync;
    
    function stream(source, options) {
        validateInput(source);
        const works = executeTasks(source, StreamProvider, options);
        return utils.stream.merge(works);
    }
    FastGlob.stream = stream;
    
    function generateTasks(source, options) {
        validateInput(source);
        const patterns = Array.isArray(source) ? source : [source];
        const settings = new Settings(options);
        return taskManager.generate(patterns, settings);
    }
    FastGlob.generateTasks = generateTasks;

    function isDynamicPattern(source, options) {
        validateInput(source);
        const settings = new Settings(options);
        return utils.pattern.isDynamicPattern(source, settings);
    }
    FastGlob.isDynamicPattern = isDynamicPattern;

    function escapePath(source) {
        validateInput(source);
        return utils.path.escape(source);
    }
    FastGlob.escapePath = escapePath;

    function convertPathToPattern(source) {
        validateInput(source);
        return utils.path.convertPathToPattern(source);
    }
    FastGlob.convertPathToPattern = convertPathToPattern;

    FastGlob.posix = {
        escapePath(source) {
            validateInput(source);
            return utils.path.escapePosixPath(source);
        },
        convertPathToPattern(source) {
            validateInput(source);
            return utils.path.convertPosixPathToPattern(source);
        }
    };

    FastGlob.win32 = {
        escapePath(source) {
            validateInput(source);
            return utils.path.escapeWindowsPath(source);
        },
        convertPathToPattern(source) {
            validateInput(source);
            return utils.path.convertWindowsPathToPattern(source);
        }
    };

})(FastGlob || (FastGlob = {}));

function executeTasks(source, Provider, options) {
    const patterns = Array.isArray(source) ? source : [source];
    const settings = new Settings(options);
    const tasks = taskManager.generate(patterns, settings);
    const provider = new Provider(settings);
    return tasks.map(provider.read, provider);
}

function validateInput(input) {
    const source = Array.isArray(input) ? input : [input];
    const isValid = source.every(item => utils.string.isString(item) && !utils.string.isEmpty(item));
    if (!isValid) {
        throw new TypeError('Patterns must be a string (non-empty) or an array of strings');
    }
}

module.exports = FastGlob;
