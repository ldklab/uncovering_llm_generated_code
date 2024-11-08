(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory((global = typeof globalThis !== 'undefined' ? globalThis : global || self).WebStreamsPolyfill = {});
    }
})(this, function(exports) {
    'use strict';

    const noop = () => {};
    const isObjectOrFunction = (value) => typeof value === 'object' && value !== null || typeof value === 'function';
  
    const resolvedPromise = Promise.resolve.bind(Promise);
    const rejectedPromise = Promise.reject.bind(Promise);

    // Utility function for creating new promises
    const createPromise = (executor) => new Promise(executor);

    // Promises utilities with safe error handling
    function safelyExecutePromise(promise, onFulfilled, onRejected) {
        promise.then(onFulfilled, onRejected || noop).catch(noop);
    }
  
    // Queue Class
    class Queue {
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
            const back = this._back;
            let newBack = back;
            if (back._elements.length === 16383) {
                newBack = { _elements: [], _next: undefined };
            }
            back._elements.push(element);
            if (newBack !== back) {
                this._back = newBack;
                back._next = newBack;
            }
            ++this._size;
        }

        shift() {
            const front = this._front;
            const cursor = this._cursor;
            const elements = front._elements;
            const value = elements[cursor];
            const nextCursor = cursor + 1;
            if (nextCursor === 16384) {
                const next = front._next;
                this._front = next;
                this._cursor = 0;
            } else {
                this._cursor = nextCursor;
            }
            --this._size;
            elements[cursor] = undefined;
            return value;
        }
    }

    // Readable Stream Classes and Controllers
    class ReadableStreamDefaultReader {
        constructor(stream) {
            validateStream(stream, 'First parameter');
            if (isStreamLocked(stream)) {
                throw new TypeError('Stream is already locked.');
            }
            this._readRequests = new Queue();
            this._associatedReadableStream = stream;
        }

        get closed() {
            if (!isReadableStreamReader(this)) throwError('closed');
            return this._closedPromise || rejectedPromise(createError('Reader is released.'));
        }

        cancel(reason = undefined) {
            if (!isReadableStreamReader(this)) throwError('cancel');
            return this._associatedReadableStream ? cancel(this._associatedReadableStream, reason) : rejectedPromise(createError('Reader is released.'));
        }

        read() {
            if (!isReadableStreamReader(this)) throwError('read');
            const promise = createPromise((resolve, reject) => {
                this._readRequests.push({ _resolve: resolve, _reject: reject });
            });
            // Additional logic for the read request goes here...
            return promise;
        }
    }

    function validateStream(stream, paramName) {
        if (!stream || typeof stream !== 'object') {
            throw new TypeError(`${paramName} is not a valid Stream object.`);
        }
    }

    function isStreamLocked(stream) {
        return !!stream._reader;
    }

    function isReadableStreamReader(reader) {
        return !!reader && reader instanceof ReadableStreamDefaultReader;
    }

    // Write the rest of the classes, functions, and utilities similarly

    exports.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
    // Export other stream classes and functionalities similarly

});
