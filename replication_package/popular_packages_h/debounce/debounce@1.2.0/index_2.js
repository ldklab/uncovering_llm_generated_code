function debounce(func, wait = 100, immediate = false) {
  let timeout, args, context, timestamp, result;

  const executeLater = () => {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(executeLater, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  };

  const debounced = function(...args) {
    context = this;
    timestamp = Date.now();
    const callNow = immediate && !timeout;

    if (!timeout) timeout = setTimeout(executeLater, wait);

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
};

debounce.debounce = debounce;

module.exports = debounce;
