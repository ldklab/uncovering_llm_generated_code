// debounce.js

/**
 * Creates a debounced function that delays the invocation of `fn` until after `wait` milliseconds
 * have elapsed since the last time it was invoked. Optionally, the function can be invoked immediately
 * if `options.immediate` is true.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {Object} [options={}] - Options to control the debouncing behavior.
 * @param {boolean} [options.immediate=false] - If `true`, the function will be invoked immediately
 *   on the leading edge of the timeout.
 * @returns {Function} The new debounced function.
 */
function debounce(fn, wait, options = {}) {
    let timeout, result;
    const immediate = options.immediate;

    // The debounced function that will be returned
    function debounced(...args) {
        // Clear previous timeout if it exists
        if (timeout) {
            clearTimeout(timeout);
        }

        // If immediate execution is required and no timeout is set
        if (immediate && !timeout) {
            result = fn.apply(this, args);
        } else {
            // Set a timeout to execute the function after the wait period
            timeout = setTimeout(() => {
                result = fn.apply(this, args);
                timeout = null;
            }, wait);
        }

        return result;
    }

    // Method to cancel the delayed function execution
    debounced.clear = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    // Method to forcefully execute the function and clear the timeout
    debounced.flush = function () {
        if (timeout) {
            clearTimeout(timeout);
            result = fn.apply(this);
            timeout = null;
        }
    };

    // Method to trigger the debounced function immediately and reset the timer
    debounced.trigger = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        result = fn.apply(this);
    };

    return debounced;
}

export default debounce;

// index.js (Usage Example)

import debounce from './debounce.js';

// Function to log the window size
function resize() {
    console.log('height', window.innerHeight);
    console.log('width', window.innerWidth);
}

// Create a debounced version of the resize function, logging only after 200ms of inactivity
window.onresize = debounce(resize, 200);

// To clear, flush, or trigger the debounced resize, you can use:
// window.onresize.clear();
// window.onresize.flush();
// window.onresize.trigger();
