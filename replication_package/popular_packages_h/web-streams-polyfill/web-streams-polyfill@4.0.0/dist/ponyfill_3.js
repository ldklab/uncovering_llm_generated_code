/**
 * @license
 * web-streams-polyfill v4.0.0
 * Copyright 2024 Mattias Buelens, Diwank Singh Tomer and other contributors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */
(function (globalScope, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory((globalScope = typeof globalThis !== 'undefined' ? globalThis : globalScope || self).WebStreamsPolyfill = {});
  }
}(this, (function (exports) {
  'use strict';

  // Dummy function for use in polyfills
  function noop() {}
  
  // Utility functions
  function isObject(value) {
    return typeof value === 'object' && value !== null || typeof value === 'function';
  }
  
  function defineProp(obj, name, value) {
    try {
      Object.defineProperty(obj, name, { value: value, configurable: true });
    } catch (ignore) {}
  }

  // Promise-related utility functions
  const promise = Promise;
  const resolvePromise = Promise.resolve.bind(promise);
  const rejectPromise = Promise.reject.bind(promise);
  const then = Promise.prototype.then;
  
  function createPromise(executor) {
    return new promise(executor);
  }

  function fulfilledPromise(value) {
    return createPromise(resolve => resolve(value));
  }

  function rejectedPromise(reason) {
    return rejectPromise(reason);
  }
  
  function handlePromise(promise, onFulfilled, onRejected) {
    return then.call(promise, onFulfilled, onRejected);
  }

  function safelyHandlePromise(promise, onFulfilled, onRejected) {
    handlePromise(handlePromise(promise, onFulfilled, onRejected), void 0, noop);
  }

  function queueMicrotaskIfAvailable(callback) {
    let queueMicrotask = callback => handlePromise(resolvePromise(void 0), callback);

    if (typeof queueMicrotask === 'function') {
      queueMicrotask = queueMicrotask;
    }
    
    return queueMicrotask(callback);
  }

  // Function invoker utility
  function invokeFunction(func, thisArg, args) {
    if (typeof func !== 'function') {
      throw new TypeError('Argument is not a function');
    }
    return Function.prototype.apply.call(func, thisArg, args);
  }

  function tryInvokeFunction(func, thisArg, args) {
    try {
      return fulfilledPromise(invokeFunction(func, thisArg, args));
    } catch (error) {
      return rejectedPromise(error);
    }
  }

  // Controller for a readable stream
  class StreamQueue {
    constructor() {
      this._cursor = 0;
      this._size = 0;
      this._front = { _elements: [], _next: void 0 };
      this._back = this._front;
    }

    get length() {
      return this._size;
    }

    push(element) {
      const back = this._back;
      let newBack = back;
      if (back._elements.length === 16383) {
        newBack = { _elements: [], _next: void 0 };
      }
      back._elements.push(element);
      if (newBack !== back) {
        this._back = newBack;
        back._next = newBack;
      }
      this._size++;
    }

    shift() {
      const front = this._front;
      let newFront = front;
      const cursor = this._cursor;
      let newCursor = cursor + 1;
      const elements = front._elements;
      const value = elements[cursor];
      if (newCursor === 16384) {
        newFront = front._next;
        newCursor = 0;
      }
      this._size--;
      this._cursor = newCursor;
      if (front !== newFront) {
        this._front = newFront;
      }
      elements[cursor] = void 0;
      return value;
    }

    forEach(callback) {
      let cursor = this._cursor;
      let node = this._front;
      let elements = node._elements;
      for (; !(cursor === elements.length && node._next === void 0 || cursor === elements.length && (node = node._next, elements = node._elements, cursor = 0, elements.length === 0));) {
        callback(elements[cursor]);
        cursor++;
      }
    }

    peek() {
      const front = this._front;
      const cursor = this._cursor;
      return front._elements[cursor];
    }
  }

  // Symbols used in various classes
  const ABORT_STEPS = Symbol('[[AbortSteps]]');
  const ERROR_STEPS = Symbol('[[ErrorSteps]]');
  const CANCEL_STEPS = Symbol('[[CancelSteps]]');
  const PULL_STEPS = Symbol('[[PullSteps]]');
  const RELEASE_STEPS = Symbol('[[ReleaseSteps]]');

  // Controller utilities
  function createReader(reader, ownerStream) {
    reader._ownerReadableStream = ownerStream;
    ownerStream._reader = reader;
    if (ownerStream._state === 'readable') {
      initReader(reader);
    } else if (ownerStream._state === 'closed') {
      finalizeReader(reader);
    } else {
      handleReaderError(reader, ownerStream._storedError);
    }
  }

  function closeStream(reader) {
    const ownerStream = reader._ownerReadableStream;
    if (ownerStream._state === 'readable') {
      rejectReadRequests(reader, new TypeError('Reader was released and can no longer be used to monitor the stream\'s closedness'));
    } else {
      handleReaderError(reader, new TypeError('Reader was released and can no longer be used to monitor the stream\'s closedness'));
    }
    ownerStream._readableStreamController[RELEASE_STEPS]();
    ownerStream._reader = void 0;
    reader._ownerReadableStream = void 0;
  }

  function handleReaderError(reader, error) {
    initReader(reader);
    rejectReaderStorage(reader, error);
  }

  function rejectReaderStorage(reader, error) {
    if (typeof reader._closedPromise_reject !== 'undefined') {
      queueMicrotaskIfAvailable(resolvePromise(reader._closedPromise));
      reader._closedPromise_reject(error);
      reader._closedPromise_resolve = void 0;
      reader._closedPromise_reject = void 0;
    }
  }

  function finalizeReader(reader) {
    if (typeof reader._closedPromise_resolve !== 'undefined') {
      reader._closedPromise_resolve(void 0);
      reader._closedPromise_resolve = void 0;
      reader._closedPromise_reject = void 0;
    }
  }

  function isSafeNumber(value) {
    return Number.isFinite || function (value) {
      return typeof value === 'number' && isFinite(value);
    };
  }

  function truncate(value) {
    return Math.trunc || function (value) {
      return value < 0 ? Math.ceil(value) : Math.floor(value);
    };
  }

  function retrieveObject(value, name) {
    if (typeof value !== 'undefined' && !(typeof value === 'object' || typeof value === 'function')) {
      throw new TypeError(`${name} is not an object.`);
    }
  }

  function validateFunction(fn, name) {
    if (typeof fn !== 'function') {
      throw new TypeError(`${name} is not a function.`);
    }
  }

  function retrieveArrayBufferViews(value, name) {
    if (!isObject(value)) {
      throw new TypeError(`${name} is not an object.`);
    }
  }

  function validateParameter(value, number, method) {
    if (typeof value === 'undefined') {
      throw new TypeError(`Parameter ${number} is required in '${method}'.`);
    }
  }

  function ensureRequired(value, name, method) {
    if (typeof value === 'undefined') {
      throw new TypeError(`${name} is required in '${method}'.`);
    }
  }

  function toNumber(value) {
    return Number(value);
  }

  function zeroIfZero(value) {
    return value === 0 ? 0 : value;
  }

  function validateRange(value, name, maxSafeInt) {
    let num = Number(value);
    if ((num = zeroIfZero(num), !isSafeNumber(num))) {
      throw new TypeError(`${name} is not a finite number`);
    }
    if ((num = zeroIfZero(truncate(num))) < 0 || num > maxSafeInt) {
      throw new TypeError(`${name} is outside the accepted range of 0 to ${maxSafeInt}, inclusive`);
    }
    return isSafeNumber(num) && num !== 0 ? num : 0;
  }

  function validateStream(value, name) {
    if (!isReadableStream(value)) {
      throw new TypeError(`${name} is not a ReadableStream.`);
    }
  }

  function createDefaultReader(stream) {
    return new ReadableStreamDefaultReader(stream);
  }

  function pushReadRequest(stream, request) {
    stream._reader._readRequests.push(request);
  }

  function fulfillReadRequest(stream, value, isDone) {
    const readRequest = stream._reader._readRequests.shift();
    isDone ? readRequest._closeSteps() : readRequest._chunkSteps(value);
  }

  function hasReadRequests(stream) {
    return stream._reader._readRequests.length > 0;
  }

  function isReadableStream(stream) {
    return stream._reader !== void 0 && isDefaultReader(stream._reader);
  }

  class ReadableStreamDefaultReader {
    constructor(stream) {
      validateParameter(stream, 1, 'ReadableStreamDefaultReader');
      validateStream(stream, 'First parameter');
      if (isLockedReader(stream)) {
        throw new TypeError('This stream has already been locked for exclusive reading by another reader');
      }
      createReader(this, stream);
      this._readRequests = new StreamQueue();
    }

    get closed() {
      return isDefaultReader(this) ? this._closedPromise : rejectedPromise(typeErrorForMethod('closed'));
    }

    cancel(reason = void 0) {
      return isDefaultReader(this) ? this._ownerReadableStream === void 0 ? rejectedPromise(typeErrorForAction('cancel')) : cancelStream(this, reason) : rejectedPromise(typeErrorForMethod('cancel'));
    }

    read() {
      if (!isDefaultReader(this)) {
        return rejectedPromise(typeErrorForMethod('read'));
      }
      if (this._ownerReadableStream === void 0) {
        return rejectedPromise(typeErrorForAction('read from'));
      }
      let resolve, reject;
      const promise = createPromise((resolveCallback, rejectCallback) => {
        resolve = resolveCallback;
        reject = rejectCallback;
      });
      requestRead(this, {
        _chunkSteps: chunk => resolve({ value: chunk, done: false }),
        _closeSteps: () => resolve({ value: void 0, done: true }),
        _errorSteps: error => reject(error)
      });
      return promise;
    }

    releaseLock() {
      if (!isDefaultReader(this)) {
        throw typeErrorForMethod('releaseLock');
      }
      if (this._ownerReadableStream !== void 0) {
        closeStream(this);
      }
    }
  }

  function isDefaultReader(reader) {
    return isObject(reader) && Object.prototype.hasOwnProperty.call(reader, '_readRequests') && reader instanceof ReadableStreamDefaultReader;
  }

  function requestRead(reader, readIntoRequest) {
    return reader._ownerReadableStream._state === 'closed' ? readIntoRequest._closeSteps() : function (readIntoRequest) {
      reader._ownerReadableStream._disturbed = true;
      if (reader._ownerReadableStream._state !== 'errored') {
        readIntoRequest._chunkSteps = readIntoRequest._chunkSteps;
        reader._ownerReadableStream._readableStreamController[PULL_STEPS](readIntoRequest);
      } else {
        readIntoRequest._errorSteps(reader._ownerReadableStream._storedError);
      }
    }(readIntoRequest);
  }

  function invokeReadRequests(reader, error) {
    const readIntoRequests = reader._readRequests;
    reader._readRequests = new StreamQueue();
    readIntoRequests.forEach((request) => {
      request._errorSteps(error);
    });
  }
  
  function typeErrorForMethod(method) {
    return new TypeError(`ReadableStreamDefaultReader.prototype.${method} can only be used on a ReadableStreamDefaultReader`);
  }

  // The code primarily defines classes and functions to provide polyfill implementations
  // for the Streams API (ReadableStream, WritableStream, TransformStream, etc.). These are
  // essential building blocks for handling and manipulating streaming data.

  // Expose the API
  defineProp(exports, 'ByteLengthQueuingStrategy', ByteLengthQueuingStrategy);
  defineProp(exports, 'CountQueuingStrategy', CountQueuingStrategy);
  defineProp(exports, 'ReadableByteStreamController', ReadableByteStreamController);
  defineProp(exports, 'ReadableStream', ReadableStream);
  defineProp(exports, 'ReadableStreamBYOBReader', ReadableStreamBYOBReader);
  defineProp(exports, 'ReadableStreamBYOBRequest', ReadableStreamBYOBRequest);
  defineProp(exports, 'ReadableStreamDefaultController', ReadableStreamDefaultController);
  defineProp(exports, 'ReadableStreamDefaultReader', ReadableStreamDefaultReader);
  defineProp(exports, 'TransformStream', TransformStream);
  defineProp(exports, 'TransformStreamDefaultController', TransformStreamDefaultController);
  defineProp(exports, 'WritableStream', WritableStream);
  defineProp(exports, 'WritableStreamDefaultController', WritableStreamDefaultController);
  defineProp(exports, 'WritableStreamDefaultWriter', WritableStreamDefaultWriter);

})));
