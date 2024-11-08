(function (global, factory) {
    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.ES6Promise = factory();
    }
}(this, function () {
    'use strict';

    function isObjectOrFunction(x) {
        return (x !== null) && (typeof x === 'object' || typeof x === 'function');
    }

    function isFunction(x) {
        return typeof x === 'function';
    }

    var isArray = Array.isArray || function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    };

    var queue = [];
    var len = 0;
    var customSchedulerFn;

    var asap = function (callback, arg) {
        queue[len] = callback;
        queue[len + 1] = arg;
        len += 2;
        if (len === 2) {
            if (customSchedulerFn) {
                customSchedulerFn(flush);
            } else {
                scheduleFlush();
            }
        }
    };

    function setScheduler(scheduleFn) {
        customSchedulerFn = scheduleFn;
    }

    function setAsap(asapFn) {
        asap = asapFn;
    }

    var BrowserMutationObserver = (typeof window !== 'undefined' ? window : {}).MutationObserver || BrowserMutationObserver;
    var isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    function useNextTick() {
        return function () {
            return process.nextTick(flush);
        };
    }

    function useMutationObserver() {
        var iterations = 0;
        var observer = new BrowserMutationObserver(flush);
        var node = document.createTextNode('');
        observer.observe(node, { characterData: true });

        return function () {
            node.data = (iterations = ++iterations % 2);
        };
    }

    function useSetTimeout() {
        return function () {
            return setTimeout(flush, 1);
        };
    }

    var scheduleFlush;
    if (isNode) {
        scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
        scheduleFlush = useMutationObserver();
    } else {
        scheduleFlush = useSetTimeout();
    }

    function then(onFulfillment, onRejection) {
        var self = this;
        var child = new this.constructor(noop);

        if (self._state) {
            var callback = arguments[self._state - 1];
            asap(function () {
                return invokeCallback(self._state, child, callback, self._result);
            });
        } else {
            subscribe(self, child, onFulfillment, onRejection);
        }

        return child;
    }

    function resolve(object) {
        if (object && typeof object === 'object' && object.constructor === this.constructor) {
            return object;
        }

        var promise = new this(noop);
        _resolve(promise, object);
        return promise;
    }

    function noop() { }

    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var PROMISE_ID = Math.random().toString(36).substring(2);

    function _resolve(promise, value) {
        if (promise === value) {
            _reject(promise, new TypeError("A promise cannot be resolved with itself"));
        } else if (isObjectOrFunction(value)) {
            var then;
            try {
                then = value.then;
            } catch (error) {
                _reject(promise, error);
                return;
            }
            if (isFunction(then)) {
                handleForeignThenable(promise, value, then);
            } else {
                _fulfill(promise, value);
            }
        } else {
            _fulfill(promise, value);
        }
    }

    function _fulfill(promise, value) {
        if (promise._state !== PENDING) return;
        promise._result = value;
        promise._state = FULFILLED;
        if (promise._subscribers.length !== 0) {
            asap(publish, promise);
        }
    }

    function _reject(promise, reason) {
        if (promise._state !== PENDING) return;
        promise._state = REJECTED;
        promise._result = reason;
        asap(publishRejection, promise);
    }

    function subscribe(parent, child, onFulfillment, onRejection) {
        var subscribers = parent._subscribers;
        var length = subscribers.length;

        parent._onerror = null;

        subscribers[length] = child;
        subscribers[length + FULFILLED] = onFulfillment;
        subscribers[length + REJECTED] = onRejection;

        if (length === 0 && parent._state) {
            asap(publish, parent);
        }
    }

    function publish(promise) {
        var subscribers = promise._subscribers;
        var settled = promise._state;

        if (subscribers.length === 0) return;

        var child, callback, detail = promise._result;
        for (let i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];

            if (child) {
                invokeCallback(settled, child, callback, detail);
            } else {
                callback(detail);
            }
        }

        promise._subscribers.length = 0;
    }

    function publishRejection(promise) {
        if (promise._onerror) {
            promise._onerror(promise._result);
        }
        publish(promise);
    }

    function invokeCallback(settled, promise, callback, detail) {
        var hasCallback = isFunction(callback), value, error, succeeded = true;

        if (hasCallback) {
            try {
                value = callback(detail);
            } catch (e) {
                succeeded = false;
                error = e;
            }

            if (promise === value) {
                _reject(promise, new TypeError('Cannot return a promise'));
                return;
            }
        } else {
            value = detail;
        }

        if (promise._state !== PENDING) {
        } else if (hasCallback && succeeded) {
            _resolve(promise, value);
        } else if (succeeded === false) {
            _reject(promise, error);
        } else if (settled === FULFILLED) {
            _fulfill(promise, value);
        } else if (settled === REJECTED) {
            _reject(promise, value);
        }
    }

    function handleForeignThenable(promise, thenable, then) {
        asap(function (promise) {
            var sealed = false;
            var error = tryThen(then, thenable, function (value) {
                if (sealed) return;
                sealed = true;
                _resolve(promise, value);
            }, function (reason) {
                if (sealed) return;
                sealed = true;
                _reject(promise, reason);
            });

            if (!sealed && error) {
                sealed = true;
                _reject(promise, error);
            }
        }, promise);
    }

    function tryThen(then, value, fulfill, reject) {
        try {
            then.call(value, fulfill, reject);
        } catch (e) {
            return e;
        }
    }

    function makePromise(promise) {
        promise[PROMISE_ID] = Math.random().toString(36).substring(2);
        promise._state = undefined;
        promise._result = undefined;
        promise._subscribers = [];
    }

    function Promise(resolver) {
        this[PROMISE_ID] = Math.random().toString(36).substring(2);
        this._state = undefined;
        this._result = undefined;
        this._subscribers = [];

        if (resolver !== noop) {
            if (typeof resolver !== 'function') {
                throw new TypeError('Promise resolver is not a function');
            }
            if (!(this instanceof Promise)) {
                throw new TypeError('Promise constructor must be called with "new"');
            }
            initializePromise(this, resolver);
        }
    }

    function initializePromise(promise, resolver) {
        try {
            resolver(function resolvePromise(value) {
                _resolve(promise, value);
            }, function rejectPromise(reason) {
                _reject(promise, reason);
            });
        } catch (e) {
            _reject(promise, e);
        }
    }

    Promise.prototype.then = then;

    Promise.all = function (values) {
        return new Enumerator(this, values, true).promise;
    };

    Promise.race = function (entries) {
        var Constructor = this;
        return new Constructor(function (resolve, reject) {
            for (var i = 0; i < entries.length; i++) {
                Constructor.resolve(entries[i]).then(resolve, reject);
            }
        });
    };

    Promise.resolve = function (object) {
        if (object && typeof object === 'object' && object.constructor === this) {
            return object;
        }

        var promise = new this(noop);
        _resolve(promise, object);
        return promise;
    };

    Promise.reject = function (reason) {
        var promise = new this(noop);
        _reject(promise, reason);
        return promise;
    };

    Promise.prototype.catch = function (onRejection) {
        return this.then(null, onRejection);
    };

    Promise.prototype.finally = function (callback) {
        var promise = this;
        var constructor = promise.constructor;

        return promise.then(function (value) {
            return constructor.resolve(callback()).then(function () {
                return value;
            });
        }, function (reason) {
            return constructor.resolve(callback()).then(function () {
                throw reason;
            });
        });
    };

    function polyfill() {
        var local;

        if (typeof global !== 'undefined') {
            local = global;
        } else if (typeof self !== 'undefined') {
            local = self;
        } else {
            try {
                local = Function('return this')();
            } catch (e) {
                throw new Error('Polyfill failed because global object is unavailable in this environment');
            }
        }

        var P = local.Promise;

        if (P) {
            var promiseToString;

            try {
                promiseToString = Object.prototype.toString.call(P.resolve());
            } catch (e) {}

            if (promiseToString === '[object Promise]' && !P.cast) {
                return;
            }
        }

        local.Promise = Promise;
    }

    Promise.polyfill = polyfill;
    Promise.Promise = Promise;

    return Promise;
}));
