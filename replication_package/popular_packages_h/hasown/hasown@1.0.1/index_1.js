'use strict';

function curry(fn, n) {
    if (typeof n !== 'number') {
        n = fn.length; // Default to the original function's arity if n isn't provided
    }

    function getCurryClosure(prevArgs) {
        return function curryClosure(...newArgs) { // Use rest parameter syntax
            const allArgs = prevArgs.concat(newArgs); // Concatenate previous and new arguments

            if (allArgs.length < n) {
                return getCurryClosure(allArgs); // Recurse if not enough arguments
            }
            
            return fn.apply(this, allArgs); // Call the original function with all the collected arguments
        };
    }

    return getCurryClosure([]); // Start with no previous arguments
}

module.exports = curry((object, property) => {
    return Object.prototype.hasOwnProperty.call(object, property); // Use arrow function for conciseness
});
