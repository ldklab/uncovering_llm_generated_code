// debounce.js

function debounce(fn, wait, options = {}) {
    let timeout, result;
    const immediate = options.immediate;

    function debounced(...args) {
        // Clear existing timeout, if any
        if (timeout) {
            clearTimeout(timeout);
        }

        // If `immediate` is true and there's no timeout set, invoke immediately
        if (immediate && !timeout) {
            result = fn.apply(this, args);
        } else {
            // Schedule the function to be invoked after the specified wait time
            timeout = setTimeout(() => {
                result = fn.apply(this, args);
                timeout = null; // Reset timeout after invocation
            }, wait);
        }

        return result; // Return the function result
    }

    // Method to clear the timeout, if set
    debounced.clear = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    // Method to immediately invoke the function if a timeout is set, and reset the timeout
    debounced.flush = function () {
        if (timeout) {
            clearTimeout(timeout);
            result = fn.apply(this); // Invoke the function immediately without arguments
            timeout = null;
        }
    };

    // Method to immediately trigger the function and reset timeout, irrespective of any timeout being set
    debounced.trigger = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        result = fn.apply(this); // Invoke the function immediately without arguments
    };

    return debounced; // Return the debounced function
}

export default debounce;

// index.js (Usage Example)

import debounce from './debounce.js';

// Example function to log window dimensions
function resize() {
    console.log('height', window.innerHeight);
    console.log('width', window.innerWidth);
}

// Debouncing the resize function, to run only after 200 ms of inactivity
window.onresize = debounce(resize, 200);

// To clear the scheduled execution
// window.onresize.clear();

// To flush the scheduled execution
// window.onresize.flush();

// To trigger and immediately execute the function, resetting the timer
// window.onresize.trigger();
