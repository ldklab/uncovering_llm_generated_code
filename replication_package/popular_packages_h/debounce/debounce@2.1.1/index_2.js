function debounce(func, wait = 100, options = {}) {
    if (typeof func !== 'function') {
        throw new TypeError(`Expected the first parameter to be a function, got \`${typeof func}\`.`);
    }

    if (wait < 0) {
        throw new RangeError('`wait` must not be negative.');
    }

    const { immediate } = (typeof options === 'boolean') ? { immediate: options } : options;

    let context, args, timeoutId, lastCall, result;

    const execute = () => {
        const thisContext = context;
        const thisArgs = args;
        context = args = undefined;
        return func.apply(thisContext, thisArgs);
    };

    const later = () => {
        const last = Date.now() - lastCall;

        if (last < wait && last >= 0) {
            timeoutId = setTimeout(later, wait - last);
        } else {
            timeoutId = undefined;
            if (!immediate) {
                result = execute();
            }
        }
    };

    const debounced = function (...arguments_) {
        if (context && this !== context && Object.getPrototypeOf(this) === Object.getPrototypeOf(context)) {
            throw new Error('Debounced method called with different contexts of the same prototype.');
        }

        context = this;
        args = arguments_;
        lastCall = Date.now();

        const callImmediately = immediate && !timeoutId;

        if (!timeoutId) {
            timeoutId = setTimeout(later, wait);
        }

        if (callImmediately) {
            result = execute();
        }

        return result;
    };

    debounced.clear = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        }
    };

    debounced.flush = () => {
        if (timeoutId) {
            debounced.trigger();
        }
    };

    debounced.trigger = () => {
        result = execute();
        debounced.clear();
    };

    return debounced;
}

module.exports.debounce = debounce;
module.exports = debounce;
