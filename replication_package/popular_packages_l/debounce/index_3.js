// debounce.js

/**
 * Creates a debounced function that delays invoking the provided function 
 * until after a specified wait time. The debounced function can be configured
 * to invoke immediately on the leading edge instead of the trailing.
 * 
 * @param {Function} fn - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {Object} options - Options object for additional configuration.
 * @param {boolean} options.immediate - If `true`, trigger the function on the leading edge instead of the trailing.
 * @returns {Function} - Returns the new debounced function.
 */
function debounce(fn, wait, options = {}) {
    let timeout, result;
    const immediate = options.immediate;

    function debounced(...args) {
        if (timeout) {
            clearTimeout(timeout);
        }

        if (immediate && !timeout) {
            result = fn.apply(this, args);
        } else {
            timeout = setTimeout(() => {
                result = fn.apply(this, args);
                timeout = null;
            }, wait);
        }

        return result;
    }

    debounced.clear = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    debounced.flush = function () {
        if (timeout) {
            clearTimeout(timeout);
            result = fn.apply(this);
            timeout = null;
        }
    };

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

/**
 * Example usage of debounce function. Applies the debounce function to a resize
 * event listener. Logs the window's height and width when resized, throttled by 200ms.
 */
import debounce from './debounce.js';

function resize() {
    console.log('height', window.innerHeight);
    console.log('width', window.innerWidth);
}

// Set the resize event listener with a debounce of 200 milliseconds.
window.onresize = debounce(resize, 200);

// To clear the scheduled execution
// window.onresize.clear();

// To flush the scheduled execution
// window.onresize.flush();

// To trigger and reset the timer
// window.onresize.trigger();
