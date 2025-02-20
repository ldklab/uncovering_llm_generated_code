"use strict";
const { signals } = require("./signals.js");

const processOk = (process) => !!process &&
    typeof process === 'object' &&
    typeof process.removeListener === 'function' &&
    typeof process.emit === 'function' &&
    typeof process.reallyExit === 'function' &&
    typeof process.listeners === 'function' &&
    typeof process.kill === 'function' &&
    typeof process.pid === 'number' &&
    typeof process.on === 'function';

const kExitEmitter = Symbol.for('signal-exit emitter');
const global = globalThis;
const ObjectDefineProperty = Object.defineProperty.bind(Object);

class Emitter {
    emitted = { afterExit: false, exit: false };
    listeners = { afterExit: [], exit: [] };
    count = 0;
    id = Math.random();
    
    constructor() {
        if (global[kExitEmitter]) return global[kExitEmitter];
        ObjectDefineProperty(global, kExitEmitter, {
            value: this,
            writable: false,
            enumerable: false,
            configurable: false,
        });
    }
    
    on(ev, fn) {
        this.listeners[ev].push(fn);
    }

    removeListener(ev, fn) {
        const list = this.listeners[ev];
        const i = list.indexOf(fn);
        if (i === -1) return;
        if (i === 0 && list.length === 1) list.length = 0;
        else list.splice(i, 1);
    }

    emit(ev, code, signal) {
        if (this.emitted[ev]) return false;
        this.emitted[ev] = true;
        let ret = false;
        for (const fn of this.listeners[ev]) {
            ret = fn(code, signal) === true || ret;
        }
        if (ev === 'exit') {
            ret = this.emit('afterExit', code, signal) || ret;
        }
        return ret;
    }
}

class SignalExitBase {}

const signalExitWrap = (handler) => ({
    onExit(cb, opts) {
        return handler.onExit(cb, opts);
    },
    load() {
        return handler.load();
    },
    unload() {
        return handler.unload();
    },
});

class SignalExitFallback extends SignalExitBase {
    onExit() {
        return () => { };
    }
    load() {}
    unload() {}
}

class SignalExit extends SignalExitBase {
    #hupSig = process.platform === 'win32' ? 'SIGINT' : 'SIGHUP';
    #emitter = new Emitter();
    #process;
    #originalProcessEmit;
    #originalProcessReallyExit;
    #sigListeners = {};
    #loaded = false;

    constructor(process) {
        super();
        this.#process = process;
        this.#sigListeners = {};
        for (const sig of signals) {
            this.#sigListeners[sig] = () => {
                const listeners = this.#process.listeners(sig);
                let { count } = this.#emitter;
                const p = process;
                if (typeof p.__signal_exit_emitter__ === 'object' &&
                    typeof p.__signal_exit_emitter__.count === 'number') {
                    count += p.__signal_exit_emitter__.count;
                }
                if (listeners.length === count) {
                    this.unload();
                    const ret = this.#emitter.emit('exit', null, sig);
                    const s = sig === 'SIGHUP' ? this.#hupSig : sig;
                    if (!ret)
                        process.kill(process.pid, s);
                }
            };
        }
        this.#originalProcessReallyExit = process.reallyExit;
        this.#originalProcessEmit = process.emit;
    }

    onExit(cb, opts) {
        if (!processOk(this.#process)) {
            return () => { };
        }
        if (this.#loaded === false) {
            this.load();
        }
        const ev = opts?.alwaysLast ? 'afterExit' : 'exit';
        this.#emitter.on(ev, cb);
        return () => {
            this.#emitter.removeListener(ev, cb);
            if (this.#emitter.listeners['exit'].length === 0 &&
                this.#emitter.listeners['afterExit'].length === 0) {
                this.unload();
            }
        };
    }

    load() {
        if (this.#loaded) return;
        this.#loaded = true;
        this.#emitter.count += 1;
        for (const sig of signals) {
            try {
                const fn = this.#sigListeners[sig];
                if (fn) this.#process.on(sig, fn);
            }
            catch (_) {}
        }
        this.#process.emit = (ev, ...a) => this.#processEmit(ev, ...a);
        this.#process.reallyExit = (code) => this.#processReallyExit(code);
    }

    unload() {
        if (!this.#loaded) return;
        this.#loaded = false;
        signals.forEach(sig => {
            const listener = this.#sigListeners[sig];
            if (!listener) {
                throw new Error('Listener not defined for signal: ' + sig);
            }
            try {
                this.#process.removeListener(sig, listener);
            }
            catch (_) {}
        });
        this.#process.emit = this.#originalProcessEmit;
        this.#process.reallyExit = this.#originalProcessReallyExit;
        this.#emitter.count -= 1;
    }

    #processReallyExit(code) {
        if (!processOk(this.#process)) {
            return 0;
        }
        this.#process.exitCode = code || 0;
        this.#emitter.emit('exit', this.#process.exitCode, null);
        return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode);
    }

    #processEmit(ev, ...args) {
        const og = this.#originalProcessEmit;
        if (ev === 'exit' && processOk(this.#process)) {
            if (typeof args[0] === 'number') {
                this.#process.exitCode = args[0];
            }
            const ret = og.call(this.#process, ev, ...args);
            this.#emitter.emit('exit', this.#process.exitCode, null);
            return ret;
        } else {
            return og.call(this.#process, ev, ...args);
        }
    }
}

const process = globalThis.process;
const signalExitHandler = processOk(process) ? new SignalExit(process) : new SignalExitFallback();

exports.onExit = signalExitHandler.onExit;
exports.load = signalExitHandler.load;
exports.unload = signalExitHandler.unload;
