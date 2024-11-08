'use strict';

const cp = require('child_process');
const parse = require('./lib/parse');
const enoent = require('./lib/enoent');

/**
 * Spawns a child process asynchronously using the provided command, arguments, and options.
 * 
 * @param {string} command - The command to run.
 * @param {Array} args - List of string arguments.
 * @param {Object} options - Configuration options for spawning.
 * @returns {ChildProcess} - The spawned child process.
 */
function spawn(command, args, options) {
    const parsed = parse(command, args, options);
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
    enoent.hookChildProcess(spawned, parsed);
    return spawned;
}

/**
 * Spawns a child process synchronously using the provided command, arguments, and options.
 * 
 * @param {string} command - The command to run.
 * @param {Array} args - List of string arguments.
 * @param {Object} options - Configuration options for spawning.
 * @returns {Object} - The result object containing output, error, status, and more.
 */
function spawnSync(command, args, options) {
    const parsed = parse(command, args, options);
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
    return result;
}

module.exports = spawn;
module.exports.spawn = spawn;
module.exports.sync = spawnSync;

module.exports._parse = parse;
module.exports._enoent = enoent;
