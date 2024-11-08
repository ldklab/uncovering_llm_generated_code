function debounce(func, wait = 100, immediate = false) {
  let timeout, args, context, timestamp, result;

  function later() {
    const last = Date.now() - timestamp;

    // If the time elapsed is less than the wait time, re-schedule `later`
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  }

  const debounced = function() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    const callNow = immediate && !timeout;

    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  // Method to clear the timeout and prevent the function from executing
  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  // Immediate call of the function if required, ignoring delay
  debounced.flush = function() {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;

      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// Adds compatibility for ES modules
debounce.debounce = debounce;

module.exports = debounce;
