'use strict';

// Check if the value is an array, using the built-in Array.isArray if available, else a fallback
const isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

// Main module function: applies a mapping function on an input array and flattens the result
module.exports = function (xs, fn) {
    let res = [];
    // Iterate over each item in the array xs
    for (let i = 0; i < xs.length; i++) {
        // Apply the function fn to each element and its index
        const x = fn(xs[i], i);
        // Check if the result is an array
        if (isArray(x)) {
            // Concatenate array results using push.apply
            res.push(...x);
        } else {
            // Push single value results directly into the res array
            res.push(x);
        }
    }
    // Return the flattened resulting array
    return res;
};
