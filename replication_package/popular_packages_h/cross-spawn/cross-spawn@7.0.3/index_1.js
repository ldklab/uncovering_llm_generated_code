'use strict';

const { spawn, spawnSync } = require('child_process');
const parse = require('./lib/parse');
const enoent = require('./lib/enoent');

function spawnCommand(command, args, options) {
    // Process the command-line arguments
    const parsed = parse(command, args, options);

    // Start an asynchronous child process
    const childProcess = spawn(parsed.command, parsed.args, parsed.options);

    // Attach an exit event handler to manage command-not-found errors
    enoent.hookChildProcess(childProcess, parsed);

    return childProcess;
}

function spawnCommandSync(command, args, options) {
    // Process the command-line arguments
    const parsed = parse(command, args, options);

    // Start a synchronous child process
    const result = spawnSync(parsed.command, parsed.args, parsed.options);

    // Check for command-not-found errors
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

    return result;
}

module.exports = spawnCommand;
module.exports.spawn = spawnCommand;
module.exports.sync = spawnCommandSync;

module.exports._parse = parse;
module.exports._enoent = enoent;
