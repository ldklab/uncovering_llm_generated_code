module.exports = wrappy;

function wrappy(fn, cb) {
  if (fn && cb) return wrappy(fn)(cb);

  if (typeof fn !== 'function') {
    throw new TypeError('need wrapper function');
  }

  const wrapper = function(...args) {
    const result = fn.apply(this, args);
    const lastArg = args[args.length - 1];

    if (typeof result === 'function' && result !== lastArg) {
      Object.keys(lastArg).forEach(key => {
        result[key] = lastArg[key];
      });
    }
    return result;
  };

  Object.keys(fn).forEach(key => {
    wrapper[key] = fn[key];
  });

  return wrapper;
}
