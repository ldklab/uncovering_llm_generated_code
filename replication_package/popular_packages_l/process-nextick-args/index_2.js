// process-nextick-args/index.js

module.exports = {
  nextTick(fn, ...args) {
    if (args.length === 0) {
      return process.nextTick(fn);
    } else {
      return process.nextTick(() => {
        fn(...args);
      });
    }
  }
};
