function debounce(func, wait = 100, options = {}) {
  if (typeof func !== 'function') {
    throw new TypeError(`Expected a function, but got ${typeof func}.`);
  }
  if (wait < 0) {
    throw new RangeError('Wait time cannot be negative.');
  }

  const { immediate } = typeof options === 'boolean' ? { immediate: options } : options;

  let timeoutId, lastArgs, lastContext, result, lastCallTime;

  function invokeFunc() {
    const context = lastContext;
    const args = lastArgs;
    lastContext = lastArgs = undefined;
    result = func.apply(context, args);
    return result;
  }

  function startTimer(pendingFunc, wait) {
    return setTimeout(pendingFunc, wait);
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    return lastCallTime === undefined || timeSinceLastCall >= wait;
  }

  function debounceFunc(...args) {
    const now = Date.now();
    const isInvoking = shouldInvoke(now);
    lastContext = this;
    lastArgs = args;
    lastCallTime = now;

    if (isInvoking) {
      if (!timeoutId && immediate) {
        timeoutId = startTimer(() => {
          timeoutId = undefined;
        }, wait);
        return invokeFunc();
      }
    }

    if (!timeoutId) {
      timeoutId = startTimer(() => {
        timeoutId = undefined;
        if (!immediate) {
          invokeFunc();
        }
      }, wait);
    }

    return result;
  }

  debounceFunc.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  debounceFunc.flush = () => {
    if (timeoutId) {
      invokeFunc();
      debounceFunc.cancel();
    }
  };

  return debounceFunc;
}

module.exports = debounce;
