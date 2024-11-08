'use strict';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function curry(fn, numArgs) {
    const arity = typeof numArgs === 'number' ? numArgs : fn.length;

    function createCurriedFunction(previousArgs = []) {
        return function curriedFunction(...newArgs) {
            const allArgs = previousArgs.concat(newArgs);

            if (allArgs.length >= arity) {
                return fn.apply(this, allArgs);
            }

            return createCurriedFunction(allArgs);
        };
    }

    return createCurriedFunction();
}

module.exports = curry(function (object, property) {
    return hasOwnProperty.call(object, property);
});
