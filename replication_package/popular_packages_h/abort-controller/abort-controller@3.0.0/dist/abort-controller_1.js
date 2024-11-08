'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const eventTargetShim = require('event-target-shim');

// Private WeakMaps to handle internal state
const abortedFlags = new WeakMap();
const signals = new WeakMap();

class AbortSignal extends eventTargetShim.EventTarget {
    constructor() {
        super();
        throw new TypeError("AbortSignal cannot be constructed directly");
    }

    get aborted() {
        const aborted = abortedFlags.get(this);
        if (typeof aborted !== 'boolean') {
            throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? 'null' : typeof this}`);
        }
        return aborted;
    }
}

eventTargetShim.defineEventAttribute(AbortSignal.prototype, 'abort');

function createAbortSignal() {
    const signal = Object.create(AbortSignal.prototype);
    eventTargetShim.EventTarget.call(signal);
    abortedFlags.set(signal, false);
    return signal;
}

function abortSignal(signal) {
    if (abortedFlags.get(signal) !== false) {
        return;
    }
    abortedFlags.set(signal, true);
    signal.dispatchEvent({ type: 'abort' });
}

Object.defineProperties(AbortSignal.prototype, {
    aborted: { enumerable: true },
});

if (typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol') {
    Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
        configurable: true,
        value: 'AbortSignal',
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

function getSignal(controller) {
    const signal = signals.get(controller);
    if (signal == null) {
        throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? 'null' : typeof controller}`);
    }
    return signal;
}

Object.defineProperties(AbortController.prototype, {
    signal: { enumerable: true },
    abort: { enumerable: true },
});

if (typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol') {
    Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
        configurable: true,
        value: 'AbortController',
    });
}

exports.AbortController = AbortController;
exports.AbortSignal = AbortSignal;
exports.default = AbortController;

module.exports = AbortController;
module.exports.AbortController = module.exports['default'] = AbortController;
module.exports.AbortSignal = AbortSignal;
