"use strict";

const { spawn } = require("child_process");
const crossSpawn = require("cross-spawn");
const { onExit } = require("signal-exit");
const { proxySignals } = require("./proxy-signals.js");
const { watchdog } = require("./watchdog.js");

// Determine which spawn function to use based on the operating system platform
const spawnFn = process.platform === 'win32' ? crossSpawn : spawn;

/**
 * Normalizes arguments passed to the `foregroundChild` function
 *
 * @param {Array} fgArgs - The arguments provided to `foregroundChild`.
 * @returns {Array} Normalized arguments.
 */
function normalizeFgArgs(fgArgs) {
    let [program, args = [], spawnOpts = {}, cleanup = () => {}] = fgArgs;

    if (typeof args === 'function') {
        cleanup = args;
        spawnOpts = {};
        args = [];
    } else if (args && typeof args === 'object' && !Array.isArray(args)) {
        if (typeof spawnOpts === 'function') cleanup = spawnOpts;
        spawnOpts = args;
        args = [];
    } else if (typeof spawnOpts === 'function') {
        cleanup = spawnOpts;
        spawnOpts = {};
    }

    if (Array.isArray(program)) {
        [program, ...args] = program;
    }

    return [program, args, { ...spawnOpts }, cleanup];
}

/**
 * Launches a child process in the foreground, allowing signal proxying and IPC communication.
 *
 * @param  {...any} fgArgs - Arguments for child process.
 * @returns {ChildProcess} - The spawned child process.
 */
function foregroundChild(...fgArgs) {
    const [program, args, spawnOpts, cleanup] = normalizeFgArgs(fgArgs);
    spawnOpts.stdio = [0, 1, 2];

    if (process.send) {
        spawnOpts.stdio.push('ipc');
    }

    const child = spawnFn(program, args, spawnOpts);

    const handleChildHangup = () => {
        try {
            child.kill('SIGHUP');
        } catch (_) {
            child.kill('SIGTERM');
        }
    };

    const exitRemover = onExit(handleChildHangup);
    proxySignals(child);
    const dog = watchdog(child);

    let completed = false;
    
    child.on('close', async (code, signal) => {
        if (completed) return;
        completed = true;
        const result = cleanup(code, signal, { watchdogPid: dog.pid });
        const resolvedResult = isPromise(result) ? await result : result;
        exitRemover();

        if (resolvedResult === false) return;
        if (typeof resolvedResult === 'string') {
            signal = resolvedResult;
            code = null;
        } else if (typeof resolvedResult === 'number') {
            code = resolvedResult;
            signal = null;
        }

        if (signal) {
            setTimeout(() => {}, 2000);
            try {
                process.kill(process.pid, signal);
            } catch (_) {
                process.kill(process.pid, 'SIGTERM');
            }
        } else {
            process.exit(code || 0);
        }
    });

    if (process.send) {
        process.removeAllListeners('message');
        child.on('message', (message, sendHandle) => process.send?.(message, sendHandle));
        process.on('message', (message, sendHandle) => child.send(message, sendHandle));
    }

    return child;
}

/**
 * Checks if an object is a promise by verifying the presence of a `then` method.
 *
 * @param {any} obj - The object to check.
 * @returns {boolean} `true` if the object is a promise, otherwise `false`.
 */
const isPromise = (obj) => !!obj && typeof obj === 'object' && typeof obj.then === 'function';

// Exported functions
exports.foregroundChild = foregroundChild;
exports.normalizeFgArgs = normalizeFgArgs;
