function debounce(func, wait = 100, immediate = false) {
  let timeout, context, args, timestamp, result;

  function later() {
    const elapsed = Date.now() - timestamp;
    if (elapsed < wait && elapsed >= 0) {
      timeout = setTimeout(later, wait - elapsed);
    } else {
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
      timeout = null;
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

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

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

// For ES module compatibility
debounce.debounce = debounce;

module.exports = debounce;
