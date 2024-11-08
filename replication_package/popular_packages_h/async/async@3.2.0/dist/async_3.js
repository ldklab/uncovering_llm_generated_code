((global, factory) => {
    // Determine the environment and export the module appropriately
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    factory((global.async = {}));
})(this, exports => {
    'use strict';

    // Utility function to apply arguments to a function
    const apply = (fn, ...args) => (...callArgs) => fn(...args, ...callArgs);
    
    const initialParams = fn => (...args) => {
        const callback = args.pop();
        return fn.call(this, args, callback);
    }

    const wrap = defer => (fn, ...args) => defer(() => fn(...args));

    const asyncify = func => {
        return isAsync(func) ? 
            (...args) => {
                const callback = args.pop();
                const promise = func.apply(this, args);
                return handlePromise(promise, callback);
            } :
            initialParams((args, callback) => {
                let result;
                try {
                    result = func.apply(this, args);
                } catch (e) {
                    return callback(e);
                }
                return result && typeof result.then === 'function' ?
                    handlePromise(result, callback) : callback(null, result);
            });
    };

    const handlePromise = (promise, callback) => 
        promise.then(value => invokeCallback(callback, null, value))
               .catch(err => invokeCallback(callback, err && err.message ? err : new Error(err)));

    const invokeCallback = (callback, error, value) => {
        try {
            callback(error, value);
        } catch (err) {
            setImmediate$1(e => { throw e }, err);
        }
    };

    const isAsync = fn => fn[Symbol.toStringTag] === 'AsyncFunction';

    const setImmediate$1 = wrap(typeof setImmediate === 'function' ? setImmediate : setTimeout);

    const applyEach = eachfn => (fns, ...callArgs) => 
        awaitify((callback) => eachfn(fns, (fn, cb) => wrapAsync(fn).apply(this, callArgs.concat(cb)), callback));

    const wrapAsync = asyncFn => typeof asyncFn !== 'function' ? 
        new Error('expected a function') : (isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn);

    const awaitify = (asyncFn, arity = asyncFn.length) => {
        if (!arity) throw new Error('arity is undefined');
        return (...args) => typeof args[arity - 1] === 'function' ? 
            asyncFn.apply(this, args) :
            new Promise((resolve, reject) => {
                args[arity - 1] = (err, ...cbArgs) => err ? reject(err) : resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
                asyncFn.apply(this, args);
            });
    };

    // More functionality would be restructured similarly...

    exports.apply = apply;
    exports.asyncify = asyncify;
    exports.applyEach = applyEach;
    // Additional exports continue...

    Object.defineProperty(exports, '__esModule', { value: true });
});
