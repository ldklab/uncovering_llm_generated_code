"use strict";

const { spawn: nodeSpawn } = require("child_process");
const crossSpawn = require("cross-spawn");
const { onExit } = require("signal-exit");
const { proxySignals } = require("./proxy-signals.js");
const { watchdog } = require("./watchdog.js");

const isPromise = (o) => !!o && typeof o === 'object' && typeof o.then === 'function';

// Chooses spawn function based on platform
const spawn = process?.platform === 'win32' ? crossSpawn : nodeSpawn;

// Normalizes arguments for foregroundChild function
const normalizeFgArgs = (fgArgs) => {
    let [program, args = [], spawnOpts = {}, cleanup = () => { }] = fgArgs;
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
        const [pp, ...pa] = program;
        program = pp;
        args = pa;
    }
    return [program, args, { ...spawnOpts }, cleanup];
};

// Spawns a child process, proxies signals, and handles cleanup
function foregroundChild(...fgArgs) {
    const [program, args, spawnOpts, cleanup] = normalizeFgArgs(fgArgs);
    spawnOpts.stdio = [0, 1, 2];
    if (process.send) {
        spawnOpts.stdio.push('ipc');
    }

    const child = spawn(program, args, spawnOpts);
    const childHangup = () => {
        try {
            child.kill('SIGHUP');
        } catch (_) {
            child.kill('SIGTERM');
        }
    };

    const removeOnExit = onExit(childHangup);
    proxySignals(child);
    const dog = watchdog(child);
    let done = false;
    
    child.on('close', async (code, signal) => {
        if (done) return;
        done = true;
        const result = cleanup(code, signal, {
            watchdogPid: dog.pid,
        });
        const res = isPromise(result) ? await result : result;
        removeOnExit();
        
        if (res === false) return;
        else if (typeof res === 'string') {
            signal = res;
            code = null;
        } else if (typeof res === 'number') {
            code = res;
            signal = null;
        }
        
        if (signal) {
            setTimeout(() => { }, 2000);
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
        child.on('message', (message, sendHandle) => {
            process.send?.(message, sendHandle);
        });
        process.on('message', (message, sendHandle) => {
            child.send(message, sendHandle);
        });
    }
    return child;
}

module.exports = {
    normalizeFgArgs,
    foregroundChild
};
