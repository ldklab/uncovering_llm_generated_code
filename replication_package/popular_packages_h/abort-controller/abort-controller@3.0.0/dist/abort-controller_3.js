'use strict';

const { EventTarget, defineEventAttribute } = require('event-target-shim');

class AbortSignal extends EventTarget {
    constructor() {
        super();
        throw new TypeError("AbortSignal cannot be constructed directly");
    }

    get aborted() {
        const isAborted = abortedFlags.get(this);
        if (typeof isAborted !== "boolean") {
            throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
        }
        return isAborted;
    }
}

defineEventAttribute(AbortSignal.prototype, "abort");

function createAbortSignal() {
    const signal = Object.create(AbortSignal.prototype);
    EventTarget.call(signal);
    abortedFlags.set(signal, false);
    return signal;
}

function abortSignal(signal) {
    if (abortedFlags.get(signal) === false) {
        abortedFlags.set(signal, true);
        signal.dispatchEvent({ type: "abort" });
    }
}

const abortedFlags = new WeakMap();
Object.defineProperties(AbortSignal.prototype, {
    aborted: { enumerable: true },
});

if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortSignal",
    });
}

class AbortController {
    constructor() {
        signals.set(this, createAbortSignal());
    }

    get signal() {
        return getSignal(this);
    }

    abort() {
        abortSignal(getSignal(this));
    }
}

const signals = new WeakMap();

function getSignal(controller) {
    const signal = signals.get(controller);
    if (!signal) {
        throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? "null" : typeof controller}`);
    }
    return signal;
}

Object.defineProperties(AbortController.prototype, {
    signal: { enumerable: true },
    abort: { enumerable: true },
});

if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortController",
    });
}

exports.AbortController = AbortController;
exports.AbortSignal = AbortSignal;
exports.default = AbortController;

module.exports = AbortController;
module.exports.AbortController = module.exports["default"] = AbortController;
module.exports.AbortSignal = AbortSignal;
