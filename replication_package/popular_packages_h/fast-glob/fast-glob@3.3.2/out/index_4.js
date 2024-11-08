"use strict";

const TaskManager = require("./managers/tasks");
const AsyncProvider = require("./providers/async");
const StreamProvider = require("./providers/stream");
const SyncProvider = require("./providers/sync");
const Settings = require("./settings");
const Utils = require("./utils");

async function FastGlob(source, options) {
    validateInput(source);
    const tasks = prepareTasks(source, AsyncProvider, options);
    const results = await Promise.all(tasks);
    return Utils.array.flatten(results);
}

FastGlob.glob = FastGlob;
FastGlob.globSync = sync;
FastGlob.globStream = stream;
FastGlob.async = FastGlob;

function sync(source, options) {
    validateInput(source);
    const tasks = prepareTasks(source, SyncProvider, options);
    return Utils.array.flatten(tasks);
}

FastGlob.sync = sync;

function stream(source, options) {
    validateInput(source);
    const tasks = prepareTasks(source, StreamProvider, options);
    return Utils.stream.merge(tasks);
}

FastGlob.stream = stream;

function generateTasks(source, options) {
    validateInput(source);
    const patterns = [].concat(source);
    const settings = new Settings(options);
    return TaskManager.generate(patterns, settings);
}

FastGlob.generateTasks = generateTasks;

function isDynamicPattern(source, options) {
    validateInput(source);
    const settings = new Settings(options);
    return Utils.pattern.isDynamicPattern(source, settings);
}

FastGlob.isDynamicPattern = isDynamicPattern;

function escapePath(source) {
    validateInput(source);
    return Utils.path.escape(source);
}

FastGlob.escapePath = escapePath;

function convertPathToPattern(source) {
    validateInput(source);
    return Utils.path.convertPathToPattern(source);
}

FastGlob.convertPathToPattern = convertPathToPattern;

FastGlob.posix = {
    escapePath: (source) => {
        validateInput(source);
        return Utils.path.escapePosixPath(source);
    },
    convertPathToPattern: (source) => {
        validateInput(source);
        return Utils.path.convertPosixPathToPattern(source);
    }
};

FastGlob.win32 = {
    escapePath: (source) => {
        validateInput(source);
        return Utils.path.escapeWindowsPath(source);
    },
    convertPathToPattern: (source) => {
        validateInput(source);
        return Utils.path.convertWindowsPathToPattern(source);
    }
};

function prepareTasks(source, ProviderType, options) {
    const patterns = [].concat(source);
    const settings = new Settings(options);
    const tasks = TaskManager.generate(patterns, settings);
    const provider = new ProviderType(settings);
    return tasks.map(task => provider.read(task));
}

function validateInput(input) {
    const patterns = [].concat(input);
    const isValid = patterns.every(item => Utils.string.isString(item) && !Utils.string.isEmpty(item));
    if (!isValid) {
        throw new TypeError('Patterns must be a string (non empty) or an array of strings');
    }
}

module.exports = FastGlob;
