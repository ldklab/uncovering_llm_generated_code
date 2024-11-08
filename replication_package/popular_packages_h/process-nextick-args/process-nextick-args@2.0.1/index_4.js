'use strict';

function selectNextTickExport() {
  if (typeof process === 'undefined' ||
      !process.version ||
      process.version.startsWith('v0.') ||
      (process.version.startsWith('v1.') && !process.version.startsWith('v1.8.'))) {
    return { nextTick: nextTick };
  } else {
    return process;
  }
}

module.exports = selectNextTickExport();

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  const len = arguments.length;
  switch (len) {
    case 0:
    case 1:
      return process.nextTick(fn);
    case 2:
      return process.nextTick(() => {
        fn(arg1);
      });
    case 3:
      return process.nextTick(() => {
        fn(arg1, arg2);
      });
    case 4:
      return process.nextTick(() => {
        fn(arg1, arg2, arg3);
      });
    default:
      const args = Array.prototype.slice.call(arguments, 1);
      return process.nextTick(() => {
        fn.apply(null, args);
      });
  }
}
