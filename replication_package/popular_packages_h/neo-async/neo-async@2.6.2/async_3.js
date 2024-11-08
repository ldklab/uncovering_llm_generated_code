(function(global, factory) {
  'use strict';
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    (global.async = global.async || {});
    factory(global.async);
  }
})(this, function(exports) {
  'use strict';

  // Utility functions
  const noop = () => {};
  const throwError = () => { throw new Error('Callback was already called.'); };

  const DEFAULT_TIMES = 5;
  const DEFAULT_INTERVAL = 0;

  const isArray = Array.isArray;
  const nativeKeys = Object.keys;
  const nativePush = Array.prototype.push;
  const iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator ? Symbol.iterator : null;

  let nextTick, asyncNextTick, asyncSetImmediate;
  createImmediate();

  // Define async collection methods
  const each = createEach(arrayEach, baseEach, symbolEach);
  const map = createMap(arrayEachIndex, baseEachIndex, symbolEachIndex, true);
  const filter = createFilter(arrayEachIndexValue, baseEachIndexValue, symbolEachIndexValue, true);
  // ... (other asynchronous operations are defined similarly)

  // Define async control flow methods
  const parallel = createParallel(arrayEachFunc, baseEachFunc);
  const series = createSeries(arrayEachFunc, baseEachFunc);
  // ... (other control flow methods)

  // Define utils like memoize, ensureAsync, etc.
  const memoize = createMemoize();
  const unmemoize = createUnmemoize();
  const ensureAsync = createEnsureAsync();
  // ... (other utilities)

  const index = {
    VERSION: '2.6.2',

    // Collection methods
    each: each,
    map: map,
    filter: filter,
    // ... (other collection methods)

    // Control flow methods
    parallel: parallel,
    series: series,
    waterfall: waterfall,
    // ... (other control flow methods)

    // Utility methods
    memoize: memoize,
    unmemoize: unmemoize,
    ensureAsync: ensureAsync,
    // ... (other utilities)

    // Async settings
    safe: createSafe,
    fast: createFast
  };

  exports.default = index;
  // Export all async functions
  nativeKeys(index).forEach(key => exports[key] = index[key]);

  // Function to set immediate or next tick depending on platform
  function createImmediate(safeMode) {
    const delay = (fn, ...args) => setTimeout(() => fn(...args));
    asyncSetImmediate = typeof setImmediate === 'function' ? setImmediate : delay;
    const version = process?.version ?? '';
    if (typeof process === 'object' && typeof process.nextTick === 'function') {
      nextTick = /^v0.10/.test(version) ? asyncSetImmediate : process.nextTick;
      asyncNextTick = /^v0/.test(version) ? asyncSetImmediate : process.nextTick;
    } else {
      nextTick = asyncNextTick = asyncSetImmediate;
    }
    if (safeMode === false) {
      nextTick = cb => cb();
    }
  }

  // Utility function implementations such as `arrayEach`, `baseEach`, `symbolEach`, etc.
  // These would be implemented here and used by async methods above.

  // Example implementation for an async function using 'each'
  function createEach(arrayEach, baseEach, symbolEach) {
    return function each(collection, iterator, callback) {
      callback = once(callback || noop);
      let size, keys;
      let completed = 0;
      if (isArray(collection)) {
        size = collection.length;
        arrayEach(collection, iterator, done);
      } else if (iteratorSymbol && collection[iteratorSymbol]) {
        size = symbolEach(collection, iterator, done);
        if (size === completed) callback(null);
      } else {
        keys = nativeKeys(collection);
        size = keys.length;
        baseEach(collection, iterator, done, keys);
      }
      if (!size) callback(null);

      function done(err, result) {
        if (err) callback(err);
        else if (++completed === size) callback(null, result);
      }
    };
  }
});
