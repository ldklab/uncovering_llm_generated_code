'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class AbortSignal {
    constructor() {
        this.onabort = null;
        listenersMap.set(this, []);
        abortedMap.set(this, false);
    }

    get aborted() {
        if (!abortedMap.has(this)) {
            throw new TypeError("Expected `this` to be an instance of AbortSignal.");
        }
        return abortedMap.get(this);
    }

    static get none() {
        return new AbortSignal();
    }

    addEventListener(_type, listener) {
        if (!listenersMap.has(this)) {
            throw new TypeError("Expected `this` to be an instance of AbortSignal.");
        }
        const listeners = listenersMap.get(this);
        listeners.push(listener);
    }

    removeEventListener(_type, listener) {
        if (!listenersMap.has(this)) {
            throw new TypeError("Expected `this` to be an instance of AbortSignal.");
        }
        const listeners = listenersMap.get(this);
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    dispatchEvent(_event) {
        throw new Error("This is a stub dispatchEvent implementation that should not be used.  It only exists for type-checking purposes.");
    }
}

function abortSignal(signal) {
    if (signal.aborted) {
        return;
    }
    if (signal.onabort) {
        signal.onabort.call(signal);
    }
    const listeners = listenersMap.get(signal);
    if (listeners) {
        listeners.forEach(listener => listener.call(signal, { type: "abort" }));
    }
    abortedMap.set(signal, true);
}

class AbortError extends Error {
    constructor(message) {
        super(message);
        this.name = "AbortError";
    }
}

class AbortController {
    constructor(parentSignals) {
        this._signal = new AbortSignal();
        if (!parentSignals) {
            return;
        }
        if (!Array.isArray(parentSignals)) {
            parentSignals = arguments;
        }
        for (let parentSignal of parentSignals) {
            if (parentSignal.aborted) {
                this.abort();
            } else {
                parentSignal.addEventListener("abort", () => this.abort());
            }
        }
    }

    get signal() {
        return this._signal;
    }

    abort() {
        abortSignal(this._signal);
    }

    static timeout(ms) {
        const signal = new AbortSignal();
        const timer = setTimeout(abortSignal, ms, signal);
        if (typeof timer.unref === "function") {
            timer.unref();
        }
        return signal;
    }
}

const listenersMap = new WeakMap();
const abortedMap = new WeakMap();

exports.AbortController = AbortController;
exports.AbortError = AbortError;
exports.AbortSignal = AbortSignal;
