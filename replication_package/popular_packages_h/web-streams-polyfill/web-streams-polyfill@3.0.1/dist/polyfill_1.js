/**
 * web-streams-polyfill v3.0.1
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.WebStreamsPolyfill = {}));
}(this, (function (exports) { 'use strict';

    var SymbolPolyfill = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ?
        Symbol :
        function (description) { return "Symbol(" + description + ")"; };

    function noop() {}
    function getGlobals() {
        if (typeof self !== 'undefined') return self;
        if (typeof window !== 'undefined') return window;
        if (typeof global !== 'undefined') return global;
        return undefined;
    }
    var globals = getGlobals();

    function typeIsObject(x) {
        return (typeof x === 'object' && x !== null) || typeof x === 'function';
    }

    var originalPromise = Promise;
    var originalPromiseThen = Promise.prototype.then;
    function newPromise(executor) {
        return new originalPromise(executor);
    }
    function promiseResolvedWith(value) {
        return Promise.resolve(value);
    }
    function promiseRejectedWith(reason) {
        return Promise.reject(reason);
    }
    function PerformPromiseThen(promise, onFulfilled, onRejected) {
        return originalPromiseThen.call(promise, onFulfilled, onRejected);
    }

    var queueMicrotask = (function () {
        var globalQueueMicrotask = globals.queueMicrotask;
        if (typeof globalQueueMicrotask === 'function') {
            return globalQueueMicrotask;
        }
        var resolvedPromise = promiseResolvedWith(undefined);
        return function (fn) { return PerformPromiseThen(resolvedPromise, fn); };
    })();

    // A utility function to check if an object is of a certain type
    function reflectCall(F, V, args) {
        if (typeof F !== 'function') {
            throw new TypeError('Argument is not a function');
        }
        return Function.prototype.apply.call(F, V, args);
    }
    function promiseCall(F, V, args) {
        try {
            return promiseResolvedWith(reflectCall(F, V, args));
        } catch (value) {
            return promiseRejectedWith(value);
        }
    }

    // Define classes for handling streams, such as SimpleQueue. This class abstracts a simple queue structure
    class SimpleQueue {
        constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = { _elements: [], _next: undefined };
            this._back = this._front;
            this._cursor = 0;
            this._size = 0;
        }
        get length() {
            return this._size;
        }
        push(element) {
            if (this._back._elements.length === 16384 - 1) {
                const newBack = { _elements: [], _next: undefined };
                this._back._next = newBack;
                this._back = newBack;
            }
            this._back._elements.push(element);
            this._size++;
        }
        shift() {
            const oldFront = this._front;
            this._front = oldFront._next;
            const oldCursor = this._cursor;
            this._cursor++;
            this._size--;
            const element = oldFront._elements[oldCursor];
            oldFront._elements[oldCursor] = undefined;
            return element;
        }
    }

    // More utility and helper functions, for reading and writing streams, handling promise chains, etc.
    // Helper functions for handling stream operations like reading, writing, and canceling
   
    // Example classes for various stream components, such as ReadableStream, WritableStream, and TransformStream
    class ReadableStream {
        constructor(underlyingSource = {}, strategy = {}) {
            // Implementation initializing readable stream and setting up controllers
        }
    }
    class WritableStream {
        constructor(underlyingSink = {}, strategy = {}) {
            // Implementation for initializing writable stream and setting up controllers
        }
    }
    class TransformStream {
        constructor(transformer = {}, writableStrategy = {}, readableStrategy = {}) {
            // Implementation for initializing transform stream and its controller
        }
    }

    // Classes for controllers that handle the internal logic of streams
    class ReadableStreamDefaultController {
        constructor() {
            // Constructor logic for readable stream controllers
        }
    }
    class WritableStreamDefaultController {
        constructor() {
            // Constructor logic for writable stream controllers
        }
    }
    class TransformStreamDefaultController {
        constructor() {
            // Constructor for transform stream controllers
        }
    }

    // Utility and helper classes for special queues or strategies
    class ByteLengthQueuingStrategy {
        constructor({ highWaterMark }) {
            this._highWaterMark = highWaterMark;
        }
    }
    class CountQueuingStrategy {
        constructor({ highWaterMark }) {
            this._highWaterMark = highWaterMark;
        }
    }

    // Export the classes for public use
    const exports$1 = {
        ReadableStream,
        WritableStream,
        TransformStream,
        ByteLengthQueuingStrategy,
        CountQueuingStrategy,
        ReadableStreamDefaultController,
        WritableStreamDefaultController,
        TransformStreamDefaultController
    };
    if (typeof globals !== 'undefined') {
        for (let prop in exports$1) {
            if (Object.prototype.hasOwnProperty.call(exports$1, prop)) {
                Object.defineProperty(globals, prop, {
                    value: exports$1[prop],
                    writable: true,
                    configurable: true
                });
            }
        }
    }

    exports.ReadableStream = ReadableStream;
    exports.WritableStream = WritableStream;
    exports.TransformStream = TransformStream;
    exports.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
    exports.CountQueuingStrategy = CountQueuingStrategy;
    exports.ReadableStreamDefaultController = ReadableStreamDefaultController;
    exports.WritableStreamDefaultController = WritableStreamDefaultController;
    exports.TransformStreamDefaultController = TransformStreamDefaultController;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
