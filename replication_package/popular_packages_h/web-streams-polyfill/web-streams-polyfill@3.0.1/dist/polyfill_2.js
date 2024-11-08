(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory((global.WebStreamsPolyfill = {}));
    }
}(this, (function (exports) {
    'use strict';

    var SymbolPolyfill = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ?
        Symbol : description => `Symbol(${description})`;

    var noop = () => {};
    var globals = (typeof self !== 'undefined') ? self : 
                  (typeof window !== 'undefined') ? window : 
                  (typeof global !== 'undefined') ? global : undefined;

    function typeIsObject(x) {
        return (typeof x === 'object' && x !== null) || typeof x === 'function';
    }

    var rethrowAssertionErrorRejection = noop;
    var originalPromise = Promise;
    var originalPromiseThen = Promise.prototype.then;
    var originalPromiseResolve = Promise.resolve.bind(originalPromise);
    var originalPromiseReject = Promise.reject.bind(originalPromise);

    function newPromise(executor) {
        return new originalPromise(executor);
    }

    function promiseResolvedWith(value) {
        return originalPromiseResolve(value);
    }

    function promiseRejectedWith(reason) {
        return originalPromiseReject(reason);
    }

    function PerformPromiseThen(promise, onFulfilled, onRejected) {
        return originalPromiseThen.call(promise, onFulfilled, onRejected);
    }

    function uponPromise(promise, onFulfilled, onRejected) {
        PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), undefined, rethrowAssertionErrorRejection);
    }

    function uponFulfillment(promise, onFulfilled) {
        uponPromise(promise, onFulfilled);
    }

    function uponRejection(promise, onRejected) {
        uponPromise(promise, undefined, onRejected);
    }

    function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
        return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
    }

    function setPromiseIsHandledToTrue(promise) {
        PerformPromiseThen(promise, undefined, rethrowAssertionErrorRejection);
    }

    var queueMicrotask = (() => {
        var globalQueueMicrotask = globals && globals.queueMicrotask;
        if (typeof globalQueueMicrotask === 'function') {
            return globalQueueMicrotask;
        }
        var resolvedPromise = promiseResolvedWith(undefined);
        return fn => PerformPromiseThen(resolvedPromise, fn);
    })();

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

    var SimpleQueue = class {
        constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = { _elements: [], _next: null };
            this._back = this._front;
        }

        get length() {
            return this._size;
        }

        push(element) {
            const oldBack = this._back;
            const newBack = (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1)
                ? { _elements: [], _next: null }
                : oldBack;
            
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
                this._back = newBack;
                oldBack._next = newBack;
            }
            this._size++;
        }

        shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];

            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
                newFront = oldFront._next;
                newCursor = 0;
            }

            this._size--;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
                this._front = newFront;
            }

            elements[oldCursor] = undefined;
            return element;
        }

        forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while (i !== elements.length || node._next !== undefined) {
                if (i === elements.length) {
                    node = node._next;
                    elements = node._elements;
                    i = 0;
                    if (elements.length === 0) break;
                }
                callback(elements[i]);
                ++i;
            }
        }

        peek() {
            return this._front._elements[this._cursor];
        }
    };

    var ReadableStreamDefaultReader = /** @class */ (function () {
        function ReadableStreamDefaultReader(stream) {
            assertRequiredArgument(stream, 1, 'ReadableStreamDefaultReader');
            assertReadableStream(stream, 'First parameter');
            if (IsReadableStreamLocked(stream)) {
                throw new TypeError('This stream already has a reader');
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
        }
        
        get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
                return promiseRejectedWith(defaultReaderBrandCheckException('closed'));
            }
            return this._closedPromise;
        }

        cancel(reason = undefined) {
            if (!IsReadableStreamDefaultReader(this)) {
                return promiseRejectedWith(defaultReaderBrandCheckException('cancel'));
            }
            if (this._ownerReadableStream === undefined) {
                return promiseRejectedWith(readerLockException('cancel'));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
        }

        read() {
            if (!IsReadableStreamDefaultReader(this)) {
                return promiseRejectedWith(defaultReaderBrandCheckException('read'));
            }
            if (this._ownerReadableStream === undefined) {
                return promiseRejectedWith(readerLockException('read from'));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve, reject) => {
                resolvePromise = resolve;
                rejectPromise = reject;
            });
            const readRequest = {
                _chunkSteps: chunk => resolvePromise({ value: chunk, done: false }),
                _closeSteps: () => resolvePromise({ value: undefined, done: true }),
                _errorSteps: e => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
        }

        releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
                throw defaultReaderBrandCheckException('releaseLock');
            }
            if (this._ownerReadableStream === undefined) return;
            if (this._readRequests.length > 0) {
                throw new TypeError('There are pending read() calls');
            }
            ReadableStreamReaderGenericRelease(this);
        }
    }());

    Object.defineProperties(ReadableStreamDefaultReader.prototype, {
        cancel: { enumerable: true },
        read: { enumerable: true },
        releaseLock: { enumerable: true },
        closed: { enumerable: true }
    });

    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: 'ReadableStreamDefaultReader',
            configurable: true
        });
    }

    function IsReadableStreamDefaultReader(x) {
        return typeIsObject(x) && Object.prototype.hasOwnProperty.call(x, '_readRequests');
    }

    function ReadableStreamDefaultReaderRead(reader, readRequest) {
        const stream = reader._ownerReadableStream;
        stream._disturbed = true;
        if (stream._state === 'closed') {
            readRequest._closeSteps();
        } else if (stream._state === 'errored') {
            readRequest._errorSteps(stream._storedError);
        } else {
            stream._readableStreamController[PullSteps](readRequest);
        }
    }

    function defaultReaderBrandCheckException(name) {
        return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
    }

    function readerLockException(name) {
        return new TypeError(`Cannot ${name} a stream using a released reader`);
    }

    function ReadableStreamReaderGenericInitialize(reader, stream) {
        reader._ownerReadableStream = stream;
        stream._reader = reader;
        if (stream._state === 'readable') {
            defaultReaderClosedPromiseInitialize(reader);
        } else if (stream._state === 'closed') {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
        } else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
        }
    }

    function ReadableStreamReaderGenericCancel(reader, reason) {
        const stream = reader._ownerReadableStream;
        return ReadableStreamCancel(stream, reason);
    }

    function ReadableStreamReaderGenericRelease(reader) {
        const stream = reader._ownerReadableStream;
        if (stream._state === 'readable') {
            defaultReaderClosedPromiseReject(reader, new TypeError("Reader was released and can no longer be used to monitor the stream's closedness"));
        } else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError("Reader was released and can no longer be used to monitor the stream's closedness"));
        }
        stream._reader = undefined;
        reader._ownerReadableStream = undefined;
    }

    function defaultReaderClosedPromiseInitialize(reader) {
        reader._closedPromise = newPromise((resolve, reject) => {
            reader._closedPromise_resolve = resolve;
            reader._closedPromise_reject = reject;
        });
    }

    function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
        defaultReaderClosedPromiseInitialize(reader);
        defaultReaderClosedPromiseReject(reader, reason);
    }

    function defaultReaderClosedPromiseInitializeAsResolved(reader) {
        defaultReaderClosedPromiseInitialize(reader);
        defaultReaderClosedPromiseResolve(reader);
    }

    function defaultReaderClosedPromiseReject(reader, reason) {
        if (reader._closedPromise_reject === undefined) return;
        setPromiseIsHandledToTrue(reader._closedPromise);
        reader._closedPromise_reject(reason);
        reader._closedPromise_resolve = undefined;
        reader._closedPromise_reject = undefined;
    }

    function defaultReaderClosedPromiseResetToRejected(reader, reason) {
        defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
    }

    function defaultReaderClosedPromiseResolve(reader) {
        if (reader._closedPromise_resolve === undefined) return;
        reader._closedPromise_resolve(undefined);
        reader._closedPromise_reject = undefined;
        reader._closedPromise_resolve = undefined;
    }

    // Implementation continues with various stream and controller classes

    // Export and add classes to the global scope
    var exports$1 = {
        ReadableStream: ReadableStream,
        ReadableStreamDefaultController: ReadableStreamDefaultController,
        ReadableByteStreamController: ReadableByteStreamController,
        ReadableStreamBYOBRequest: ReadableStreamBYOBRequest,
        ReadableStreamDefaultReader: ReadableStreamDefaultReader,
        ReadableStreamBYOBReader: ReadableStreamBYOBReader,
        WritableStream: WritableStream,
        WritableStreamDefaultController: WritableStreamDefaultController,
        WritableStreamDefaultWriter: WritableStreamDefaultWriter,
        ByteLengthQueuingStrategy: ByteLengthQueuingStrategy,
        CountQueuingStrategy: CountQueuingStrategy,
        TransformStream: TransformStream,
        TransformStreamDefaultController: TransformStreamDefaultController
    };

    if (typeof globals !== 'undefined') {
        for (var prop in exports$1) {
            if (Object.prototype.hasOwnProperty.call(exports$1, prop)) {
                Object.defineProperty(globals, prop, {
                    value: exports$1[prop],
                    writable: true,
                    configurable: true
                });
            }
        }
    }

    exports.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
    exports.CountQueuingStrategy = CountQueuingStrategy;
    exports.ReadableByteStreamController = ReadableByteStreamController;
    exports.ReadableStream = ReadableStream;
    exports.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
    exports.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
    exports.ReadableStreamDefaultController = ReadableStreamDefaultController;
    exports.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
    exports.TransformStream = TransformStream;
    exports.TransformStreamDefaultController = TransformStreamDefaultController;
    exports.WritableStream = WritableStream;
    exports.WritableStreamDefaultController = WritableStreamDefaultController;
    exports.WritableStreamDefaultWriter = WritableStreamDefaultWriter;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=polyfill.js.map
