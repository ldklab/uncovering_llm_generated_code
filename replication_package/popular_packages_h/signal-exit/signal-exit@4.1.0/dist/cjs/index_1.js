"use strict";
const { signals } = require("./signals.js");

const isProcessValid = (process) => process && typeof process === 'object' &&
  typeof process.removeListener === 'function' &&
  typeof process.emit === 'function' &&
  typeof process.reallyExit === 'function' &&
  typeof process.listeners === 'function' &&
  typeof process.kill === 'function' &&
  typeof process.pid === 'number' &&
  typeof process.on === 'function';

const globalEmitterSymbol = Symbol.for('signal-exit emitter');
const global = globalThis;

class SimpleEmitter {
    emitted = { afterExit: false, exit: false };
    listeners = { afterExit: [], exit: [] };
    constructor() {
        if (global[globalEmitterSymbol]) {
            return global[globalEmitterSymbol];
        } else {
            Object.defineProperty(global, globalEmitterSymbol, {
                value: this,
                writable: false,
                enumerable: false,
                configurable: false,
            });
        }
    }
    on(event, callback) {
        this.listeners[event].push(callback);
    }
    removeListener(event, callback) {
        const idx = this.listeners[event].indexOf(callback);
        if (idx !== -1) {
            this.listeners[event].splice(idx, 1);
        }
    }
    emit(event, code, signal) {
        if (this.emitted[event]) return false;
        this.emitted[event] = true;
        let triggered = false;
        for (const listener of this.listeners[event]) {
            if (listener(code, signal) === true) triggered = true;
        }
        if (event === 'exit') {
            triggered = this.emit('afterExit', code, signal) || triggered;
        }
        return triggered;
    }
}

class SignalHandlerBase {}

class SignalHandlerFallback extends SignalHandlerBase {
    onExit() { return () => {}; }
    load() {}
    unload() {}
}

class SignalHandler extends SignalHandlerBase {
    #hupSignal = process.platform === 'win32' ? 'SIGINT' : 'SIGHUP';
    #emitter = new SimpleEmitter();
    #originalEmit;
    #originalReallyExit;
    #listeners = {};
    #loaded = false;

    constructor(processInstance) {
        super();
        if (!isProcessValid(processInstance)) return;
        this.process = processInstance;
        this.#originalEmit = processInstance.emit;
        this.#originalReallyExit = processInstance.reallyExit;
        signals.forEach(signal => {
            this.#listeners[signal] = () => {
                if (this.process.listeners(signal).length === this.#emitter.listeners.exit.length) {
                    this.unload();
                    if (!this.#emitter.emit('exit', null, signal)) {
                        process.kill(process.pid, signal === 'SIGHUP' ? this.#hupSignal : signal);
                    }
                }
            };
        });
    }

    onExit(callback, options) {
        if (!isProcessValid(this.process)) return () => {};
        if (!this.#loaded) this.load();
        const eventKey = options?.alwaysLast ? 'afterExit' : 'exit';
        this.#emitter.on(eventKey, callback);
        return () => {
            this.#emitter.removeListener(eventKey, callback);
            if (!this.#emitter.listeners.exit.length && !this.#emitter.listeners.afterExit.length) {
                this.unload();
            }
        };
    }

    load() {
        if (this.#loaded) return;
        this.#loaded = true;
        this.#emitter.listeners.exit.length += 1;
        signals.forEach(signal => {
            try {
                this.process.on(signal, this.#listeners[signal]);
            } catch {}
        });
        this.process.emit = (event, ...args) => this.#interceptEmit(event, ...args);
        this.process.reallyExit = (code) => this.#interceptReallyExit(code);
    }

    unload() {
        if (!this.#loaded) return;
        this.#loaded = false;
        signals.forEach(signal => {
            try {
                this.process.removeListener(signal, this.#listeners[signal]);
            } catch {}
        });
        this.process.emit = this.#originalEmit;
        this.process.reallyExit = this.#originalReallyExit;
        this.#emitter.listeners.exit.length -= 1;
    }

    #interceptReallyExit(code) {
        if (!isProcessValid(this.process)) return;
        this.#emitter.emit('exit', this.process.exitCode = code || 0, null);
        this.#originalReallyExit.call(this.process, this.process.exitCode);
    }

    #interceptEmit(event, ...args) {
        if (event === 'exit' && isProcessValid(this.process)) {
            if (typeof args[0] === 'number') this.process.exitCode = args[0];
            const result = this.#originalEmit.call(this.process, event, ...args);
            this.#emitter.emit('exit', this.process.exitCode, null);
            return result;
        } else {
            return this.#originalEmit.call(this.process, event, ...args);
        }
    }
}

const processInstance = global.process;
const handler = new (isProcessValid(processInstance) ? SignalHandler : SignalHandlerFallback)(processInstance);

exports.onExit = handler.onExit.bind(handler);
exports.load = handler.load.bind(handler);
exports.unload = handler.unload.bind(handler);
