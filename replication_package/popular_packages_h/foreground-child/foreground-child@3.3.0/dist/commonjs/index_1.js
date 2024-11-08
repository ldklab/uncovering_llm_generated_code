"use strict";
const { spawn } = require("child_process");
const crossSpawn = require("cross-spawn");
const { onExit } = require("signal-exit");
const { proxySignals } = require("./proxy-signals.js");
const { watchdog } = require("./watchdog.js");

const childSpawn = process.platform === 'win32' ? crossSpawn : spawn;

/**
 * Normalizes the arguments passed to `foregroundChild`.
 * @internal
 */
const normalizeFgArgs = (fgArgs) => {
    let [program, args = [], spawnOpts = {}, cleanup = () => {}] = fgArgs;
    if (typeof args === 'function') {
        cleanup = args;
        args = [];
        spawnOpts = {};
    } else if (typeof args === 'object' && !Array.isArray(args)) {
        if (typeof spawnOpts === 'function') {
            cleanup = spawnOpts;
        }
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
};

function foregroundChild(...fgArgs) {
    const [program, args, spawnOpts, cleanup] = normalizeFgArgs(fgArgs);
    spawnOpts.stdio = [0, 1, 2];
    if (process.send) {
        spawnOpts.stdio.push('ipc');
    }

    const child = childSpawn(program, args, spawnOpts);
    const handleExit = () => {
        try {
            child.kill('SIGHUP');
        } catch (_) {
            child.kill('SIGTERM');
        }
    };

    const removeExitHandler = onExit(handleExit);
    proxySignals(child);
    const dogMonitor = watchdog(child);
    let processFinished = false;
    child.on('close', async (code, signal) => {
        if (processFinished) return;
        processFinished = true;
        
        const cleanupResult = cleanup(code, signal, { watchdogPid: dogMonitor.pid });
        const resolvedCleanup = isPromise(cleanupResult) ? await cleanupResult : cleanupResult;
        
        removeExitHandler();
        if (resolvedCleanup === false) return;
        
        if (typeof resolvedCleanup === 'string') {
            signal = resolvedCleanup;
            code = null;
        } else if (typeof resolvedCleanup === 'number') {
            code = resolvedCleanup;
            signal = null;
        }
        
        if (signal) {
            setTimeout(() => {}, 2000); // Ensure process is alive to handle signal
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
        child.on('message', (msg, handle) => process.send && process.send(msg, handle));
        process.on('message', (msg, handle) => child.send(msg, handle));
    }

    return child;
}

const isPromise = (o) => !!o && typeof o.then === 'function';

exports.normalizeFgArgs = normalizeFgArgs;
exports.foregroundChild = foregroundChild;
