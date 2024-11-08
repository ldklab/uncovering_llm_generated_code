'use strict';

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * Curries a function, allowing it to be called with fewer arguments than it expects.
 * Returns a new function until all arguments are provided.
 * @param {Function} fn - The function to curry.
 * @param {number} [n] - The arity of the function.
 * @returns {Function} - The curried function.
 */
function curry(fn, n = fn.length) {

    /**
     * Returns a closure to collect arguments until the function's arity is satisfied.
     * @param {Array} prevArgs - The previously collected arguments.
     * @returns {Function} - The curry closure collecting further arguments.
     */
    function getCurryClosure(prevArgs) {

        /**
         * The curry closure function that collects arguments.
         * @returns {*} - The result of the function application once all args are present.
         */
        function curryClosure(...args) {
            const allArgs = prevArgs.concat(args);

            if (allArgs.length < n) {
                return getCurryClosure(allArgs);
            }

            return fn.apply(this, allArgs);
        }

        return curryClosure;
    }

    return getCurryClosure([]);
}

/**
 * Checks if the given property is a direct property of the object.
 * @param {Object} object - The object to check.
 * @param {string} property - The property name to check for.
 * @returns {boolean} - True if the object has the property as its own.
 */
module.exports = curry((object, property) => hasOwn.call(object, property));
