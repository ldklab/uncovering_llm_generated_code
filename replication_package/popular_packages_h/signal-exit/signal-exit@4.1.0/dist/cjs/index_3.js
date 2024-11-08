"use strict";

// Dependencies and Exports
const { signals } = require("./signals.js");
exports.signals = signals;
exports.onExit = exports.load = exports.unload = undefined;

// Validate the process object
const isProcessValid = (proc) => {
    return typeof proc === 'object' && [
        'removeListener', 'emit', 'reallyExit',
        'listeners', 'kill', 'pid', 'on'
    ].every(fn => typeof proc[fn] === 'function');
};

// Emitter Singleton for Exit Signals
class Emitter {
    constructor() {
        if (globalThis[kExitEmitter]) return globalThis[kExitEmitter];

        Object.defineProperty(globalThis, kExitEmitter, {
            value: this,
            writable: false,
            configurable: false
        });

        this.emitted = { exit: false, afterExit: false };
        this.listeners = { exit: [], afterExit: [] };
        this.count = 0;
    }

    on(event, callback) {
        this.listeners[event].push(callback);
    }

    removeListener(event, callback) {
        const idx = this.listeners[event].indexOf(callback);
        if (idx !== -1) this.listeners[event].splice(idx, 1);
    }

    emit(event, code, signal) {
        if (this.emitted[event]) return false;
        this.emitted[event] = true;

        return this.listeners[event].reduce((ret, fn) => {
            return fn(code, signal) === true || ret;
        }, false) || (event === 'exit' && this.emit('afterExit', code, signal));
    }
}

// Base Class for Signal Handling
class SignalExitBase { }

// Wraps SignalExit Functionality
const signalExitWrap = (handler) => ({
    onExit(callback, options) {
        return handler.onExit(callback, options);
    },
    load() {
        handler.load();
    },
    unload() {
        handler.unload();
    }
});

// Fallback Handler for Unsupported Environments
class SignalExitFallback extends SignalExitBase {
    onExit() { return () => { }; }
    load() { }
    unload() { }
}

// Manages Signals and Exit Listeners
class SignalExit extends SignalExitBase {
    #hupSig;
    #emitter;
    #process;
    #originalProcessEmit;
    #originalProcessReallyExit;
    #sigListeners = {};
    #loaded = false;

    constructor(proc) {
        super();
        this.#process = proc;
        this.#hupSig = proc.platform === 'win32' ? 'SIGINT' : 'SIGHUP';
        this.#emitter = new Emitter();

        signals.forEach(sig => {
            this.#sigListeners[sig] = () => this.#handleSignal(sig);
        });

        this.#originalProcessEmit = proc.emit;
        this.#originalProcessReallyExit = proc.reallyExit;
    }

    #handleSignal(sig) {
        const listeners = this.#process.listeners(sig);
        let { count } = this.#emitter;

        const existingEmitter = this.#process.__signal_exit_emitter__;
        if (existingEmitter && typeof existingEmitter.count === 'number') {
            count += existingEmitter.count;
        }

        if (listeners.length === count) {
            this.unload();
            const emitted = this.#emitter.emit('exit', null, sig);
            if (!emitted) this.#process.kill(this.#process.pid, this.#canonicalSignal(sig));
        }
    }

    #canonicalSignal(sig) {
        return sig === 'SIGHUP' ? this.#hupSig : sig;
    }

    onExit(callback, options = {}) {
        if (!isProcessValid(this.#process)) return () => { };

        if (!this.#loaded) this.load();
        const event = options.alwaysLast ? 'afterExit' : 'exit';
        this.#emitter.on(event, callback);

        return () => {
            this.#emitter.removeListener(event, callback);
            if (!this.#emitter.listeners.exit.length && !this.#emitter.listeners.afterExit.length) {
                this.unload();
            }
        };
    }

    load() {
        if (this.#loaded) return;
        this.#loaded = true;
        this.#emitter.count++;

        signals.forEach(sig => {
            const fn = this.#sigListeners[sig];
            if (fn) this.#process.on(sig, fn);
        });

        this.#process.emit = this.#processEmit.bind(this);
        this.#process.reallyExit = this.#processReallyExit.bind(this);
    }

    unload() {
        if (!this.#loaded) return;
        this.#loaded = false;
        this.#emitter.count--;

        signals.forEach(sig => {
            this.#process.removeListener(sig, this.#sigListeners[sig]);
        });

        this.#process.emit = this.#originalProcessEmit;
        this.#process.reallyExit = this.#originalProcessReallyExit;
    }

    #processReallyExit(code) {
        if (!isProcessValid(this.#process)) return 0;

        this.#process.exitCode = code || 0;
        this.#emitter.emit('exit', this.#process.exitCode, null);
        return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode);
    }

    #processEmit(event, ...args) {
        if (event === 'exit' && isProcessValid(this.#process)) {
            if (typeof args[0] === 'number') {
                this.#process.exitCode = args[0];
            }

            const ret = this.#originalProcessEmit.call(this.#process, event, ...args);
            this.#emitter.emit('exit', this.#process.exitCode, null);
            return ret;
        } else {
            return this.#originalProcessEmit.call(this.#process, event, ...args);
        }
    }
}

// Global Process Handling
const globalProcess = globalThis.process;

// Export wrapped handlers
const exitHandler = signalExitWrap(isProcessValid(globalProcess) ? new SignalExit(globalProcess) : new SignalExitFallback());
exports.onExit = exitHandler.onExit;
exports.load = exitHandler.load;
exports.unload = exitHandler.unload;
