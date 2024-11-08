(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function isFunction(x) {
    return typeof x === 'function';
}

function isObjectOrFunction(x) {
    return typeof x === 'object' && x !== null || isFunction(x);
}

function makePromise(promise) {
    promise._state = undefined;
    promise._result = undefined;
    promise._subscribers = [];
}

function noop() {}

function async(callback) {
    return typeof process !== 'undefined' && {}.toString.call(process) === '[object process]'
        ? process.nextTick(callback)
        : setTimeout(callback, 0);
}

function resolve(promise, value) {
    if (promise === value) {
        reject(promise, new TypeError("Self resolution"));
    } else if (isObjectOrFunction(value)) {
        let then;
        try {
            then = value.then;
        } catch (e) {
            reject(promise, e);
            return;
        }
        handleThenable(promise, value, then);
    } else {
        fulfill(promise, value);
    }
}

function fulfill(promise, value) {
    if (promise._state !== undefined) return;
    promise._state = 1;
    promise._result = value;
    triggerAsyncSubscribers(promise);
}

function reject(promise, reason) {
    if (promise._state !== undefined) return;
    promise._state = 2;
    promise._result = reason;
    triggerAsyncSubscribers(promise);
}

function triggerAsyncSubscribers(promise) {
    async(() => {
        const subscribers = promise._subscribers;
        const settled = promise._state;
        const result = promise._result;

        for (let i = 0; i < subscribers.length; i += 3) {
            const child = subscribers[i];
            const callback = subscribers[i + settled];
            let value, error, succeeded;

            try {
                if (isFunction(callback)) {
                    value = callback(result);
                    resolve(child, value);
                } else {
                    if (settled === 1) fulfill(child, result);
                    else reject(child, result);
                }
            } catch (e) {
                reject(child, e);
            }
        }

        promise._subscribers.length = 0;
    });
}

function handleThenable(promise, value, then) {
    if (value instanceof Promise$1 && then === then) {
        promise._state = value._state;
        promise._result = value._result;
        triggerAsyncSubscribers(promise);
    } else if (isFunction(then)) {
        let sealed = false;
        try {
            then.call(value, 
                (val) => {
                    if (sealed) return;
                    sealed = true;
                    resolve(promise, val);
                }, 
                (reason) => {
                    if (sealed) return;
                    sealed = true;
                    reject(promise, reason);
                });
        } catch (e) {
            if (sealed) return;
            sealed = true;
            reject(promise, e);
        }
    } else {
        fulfill(promise, value);
    }
}

function subscribe(parent, child, onFulfillment, onRejection) {
    const subscribers = parent._subscribers;
    subscribers.push(child, onFulfillment, onRejection);

    if (parent._state !== undefined) {
        async(() => triggerAsyncSubscribers(parent));
    }
}

function then(onFulfillment, onRejection) {
    const parent = this;
    const child = new this.constructor(noop);

    if (child._state === undefined) {
        makePromise(child);
    }

    if (parent._state !== undefined) {
        async(() => invokeCallback(parent._state, child, arguments[parent._state - 1], parent._result));
    } else {
        subscribe(parent, child, onFulfillment, onRejection);
    }

    return child;
}

function invokeCallback(state, promise, callback, result) {
    if (!isFunction(callback)) {
        if (state === 1) resolve(promise, result);
        else reject(promise, result);
        return;
    }

    let value;
    try {
        value = callback(result);
    } catch (e) {
        reject(promise, e);
        return;
    }

    resolve(promise, value);
}

function Promise$1(resolver) {
    if (!isFunction(resolver)) {
        throw new TypeError('Promise resolver is not a function');
    }
    if (!(this instanceof Promise$1)) {
        throw new TypeError('Cannot call a class as a function');
    }

    makePromise(this);
    try {
        resolver((value) => resolve(this, value), (reason) => reject(this, reason));
    } catch (e) {
        reject(this, e);
    }
}

Promise$1.prototype.then = then;

Promise$1.all = function (entries) {
    const Constructor = this;
    return new Constructor((resolve, reject) => {
        if (!Array.isArray(entries)) {
            return reject(new TypeError('You must pass an array to all.'));
        }
        
        const len = entries.length;
        if (len === 0) return resolve([]);

        const result = new Array(len);
        let remaining = len;

        function resolver(i) {
            return (value) => {
                result[i] = value;
                if (--remaining === 0) resolve(result);
            };
        }

        for (let i = 0; i < len; i++) {
            Constructor.resolve(entries[i]).then(resolver(i), reject);
        }
    });
};

Promise$1.race = function (entries) {
    const Constructor = this;
    return new Constructor((resolve, reject) => {
        if (!Array.isArray(entries)) {
            return reject(new TypeError('You must pass an array to race.'));
        }
        for (let entry of entries) {
            Constructor.resolve(entry).then(resolve, reject);
        }
    });
};

Promise$1.resolve = function (object) {
    const Constructor = this;
    if (object instanceof Constructor) {
        return object;
    }

    return new Constructor((resolve) => resolve(object));
};

Promise$1.reject = function (reason) {
    const Constructor = this;
    return new Constructor((resolve, reject) => reject(reason));
};

Promise$1.prototype.catch = function (onRejection) {
    return this.then(undefined, onRejection);
};

Promise$1.prototype.finally = function (callback) {
    const promise = this;
    const constructor = promise.constructor;

    if (!isFunction(callback)) {
        return promise.then(callback, callback);
    }

    return promise.then(
        value => constructor.resolve(callback()).then(() => value),
        reason => constructor.resolve(callback()).then(() => { throw reason; })
    );
};

function polyfill() {
    const local = typeof global !== 'undefined' ? global : self;
    const P = local.Promise;
    
    if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
    }

    local.Promise = Promise$1;
}

polyfill();

return Promise$1;

})));
