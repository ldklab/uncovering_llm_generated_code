module.exports = wrappy;

function wrappy(fn, cb) {
  if (fn && cb) return wrappy(fn)(cb);

  if (typeof fn !== 'function') {
    throw new TypeError('need wrapper function');
  }

  Object.assign(wrapper, fn);

  return wrapper;

  function wrapper() {
    const args = Array.from(arguments);
    const ret = fn.apply(this, args);
    const cb = args[args.length - 1];

    if (typeof ret === 'function' && ret !== cb) {
      Object.assign(ret, cb);
    }

    return ret;
  }
}
