"use strict";

// Import necessary modules and plugins
const debug = require("debug");
const { GitExecutor } = require("./lib/runners/git-executor");
const { SimpleGitApi } = require("./lib/simple-git-api");
const { Scheduler } = require("./lib/runners/scheduler");
const { completionDetectionPlugin, errorDetectionPlugin, customBinaryPlugin } = require("./lib/plugins");
const { createInstanceConfig, pathspec, asArray, filterType, filterString, trailingFunctionArgument, getTrailingOptions } = require("./lib/utils");
const { parseBranchDeletions, parseBranchSummary } = require("./lib/parsers/parse-branch");
const { parseFetchResult } = require("./lib/parsers/parse-fetch");
const { parsePushResult } = require("./lib/parsers/parse-push");
const { parseStatusSummary } = require("./lib/responses/StatusSummary");
const { parsePullResult, parsePullErrorResult } = require("./lib/parsers/parse-pull");

// Define key constants
const LOG_NAMESPACE = "simple-git";
debug.formatters.L = value => String(filterHasLength(value) ? value.length : "-");
debug.formatters.B = value => Buffer.isBuffer(value) ? value.toString("utf8") : objectToString(value);
const NOOP = () => {};

// Create logger
function createLog() {
    return debug(LOG_NAMESPACE);
}

// in lib/git-factory
function gitInstanceFactory(baseDir, options) {
    const plugins = new PluginStore();
    const config = createInstanceConfig(baseDir ? { baseDir } : {}, options);

    if (!folderExists(config.baseDir)) {
        throw new Error('Cannot use simple-git on a directory that does not exist');
    }

    if (Array.isArray(config.config)) {
        plugins.add(commandConfigPrefixingPlugin(config.config));
    }

    plugins.add(blockUnsafeOperationsPlugin(config.unsafe));
    plugins.add(completionDetectionPlugin(config.completion));
    plugins.add(progressMonitorPlugin(config.progress));
    customBinaryPlugin(plugins, config.binary);
    
    // Configuration of error handling plugins
    plugins.add(errorDetectionPlugin(errorDetectionHandler(true)));
    config.errors && plugins.add(errorDetectionPlugin(config.errors));

    return new Git(config, plugins);
}

// Define the main Git class extending functionalities from SimpleGitApi
class Git extends SimpleGitApi {
    constructor(options, plugins) {
        super(new GitExecutor(options.baseDir, new Scheduler(options.maxConcurrentProcesses), plugins));
        this._plugins = plugins;
        this._trimmed = options.trimmed;
    }

    customBinary(command) {
        this._plugins.reconfigure('binary', command);
        return this;
    }

    env(name, value) {
        if (arguments.length === 1 && typeof name === 'object') {
            this._executor.env = name;
        } else {
            (this._executor.env = this._executor.env || {})[name] = value;
        }
        return this;
    }

    add(files) {
        return this._runTask(straightThroughStringTask(['add', ...asArray(files)]), trailingFunctionArgument(arguments));
    }

    // other methods...

    push(remote, branch, options, then) {
        return this._runTask(pushTask({ remote, branch }, getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
    }
}

// Export the main simple-git function entry point
function simpleGit(baseDir, options) {
    return gitInstanceFactory(baseDir, options);
}

module.exports = {
    ...simpleGit,
    simpleGit,
    Git,
    GitExecutor,
    Scheduler,
    // other exports...
};
