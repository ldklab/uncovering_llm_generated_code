// process-nextick-args/index.js

module.exports = {
  nextTick: function (fn, ...args) {
    if (args.length === 0) {
      return process.nextTick(fn);
    } else {
      return process.nextTick(() => {
        fn(...args);
      });
    }
  }
};
