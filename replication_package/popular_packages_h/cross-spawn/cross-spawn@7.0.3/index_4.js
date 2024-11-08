'use strict';

const childProcess = require('child_process');
const parseArgs = require('./lib/parse');
const handleEnoent = require('./lib/enoent');

function executeAsync(command, args, options) {
    // Parse the command, arguments, and options
    const parsedInput = parseArgs(command, args, options);

    // Execute the command as a child process
    const childProc = childProcess.spawn(parsedInput.command, parsedInput.args, parsedInput.options);

    // Set up error handling for non-existent commands
    handleEnoent.hookChildProcess(childProc, parsedInput);

    return childProc;
}

function executeSync(command, args, options) {
    // Parse the command, arguments, and options
    const parsedInput = parseArgs(command, args, options);

    // Execute the command synchronously as a child process
    const execResult = childProcess.spawnSync(parsedInput.command, parsedInput.args, parsedInput.options);

    // Verify if the command exists and assign error if not
    execResult.error = execResult.error || handleEnoent.verifyENOENTSync(execResult.status, parsedInput);

    return execResult;
}

module.exports = executeAsync;
module.exports.executeAsync = executeAsync;
module.exports.executeSync = executeSync;

module.exports._parseArgs = parseArgs;
module.exports._handleEnoent = handleEnoent;
