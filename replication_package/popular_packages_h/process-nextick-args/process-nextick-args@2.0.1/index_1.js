'use strict';

const shouldUseCustomNextTick = (typeof process === 'undefined' ||
  !process.version ||
  process.version.startsWith('v0.') ||
  (process.version.startsWith('v1.') && !process.version.startsWith('v1.8.')));

module.exports = shouldUseCustomNextTick ? { nextTick } : process;

function nextTick(fn, ...args) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }

  process.nextTick(() => fn(...args));
}
