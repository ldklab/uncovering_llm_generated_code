(function(global, factory) {
  'use strict';
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    global.async = factory(global.async || {});
  }
})(this, function(exports) {
  'use strict';

  // Utility functions
  var noop = function() {};
  var once = function(fn) {
    var called = false;
    return function() {
      if (called) throw new Error('Callback was already called.');
      called = true;
      fn.apply(this, arguments); 
    };
  };
    
  // Collection manipulation functions
  function each(coll, iteratee, callback) {
    callback = callback || noop;
    let count = 0, doneCount = 0;
    const keys = Object.keys(coll);

    const done = (err) => {
      if (err) return callback(err);
      if (++doneCount === keys.length) callback(null);
    };

    keys.forEach(key => {
      count++;
      iteratee(coll[key], done);
    });

    if (!count) callback(null);
  }

  function map(coll, iteratee, callback) {
    callback = callback || noop;
    const result = Array.isArray(coll) ? [] : {};
    let doneCount = 0;

    each(coll, (value, done) => {
      iteratee(value, (err, transformed) => {
        if (err) return callback(err);
        result[doneCount++] = transformed;
        done();
      });
    }, (err) => callback(err, result));
  }
  
  // Control flow functions
  function series(tasks, callback) {
    callback = callback || noop;
    let index = 0;

    function next(err, result) {
      if (err || index === tasks.length) return callback(err, result);
      const task = tasks[index++];
      task(next);
    }

    next();
  }
  
  function parallel(tasks, callback) {
    callback = callback || noop;
    let completed = 0, results = [];

    tasks.forEach((task, i) => task((err, result) => {
      if (err) return callback(err);
      results[i] = result;
      if (++completed === tasks.length) callback(null, results);
    }));

    if (!tasks.length) callback(null, results);
  }

  function waterfall(tasks, callback) {
    callback = callback || noop;
    let index = 0;

    function next(err, ...args) {
      if (err || index === tasks.length) return callback(err, ...args);
      const task = tasks[index++];
      task(...args, next);
    }

    next();
  }
  
  // Utility methods
  function retry(times, task, callback) {
    let attempts = 0;
    const attempt = () => task((err, result) => {
      if (!err || ++attempts === times) return callback(err, result);
      attempt();
    });
    
    attempt();
  }

  function memoize(fn) {
    const cache = {};
    return function() {
      const key = JSON.stringify(arguments);
      if (cache[key]) return cache[key];
      const result = fn.apply(this, arguments);
      cache[key] = result;
      return result;
    };
  }

  // Apply to exports
  exports.each = each;
  exports.map = map;
  exports.series = series;
  exports.parallel = parallel;
  exports.waterfall = waterfall;
  exports.retry = retry;
  exports.memoize = memoize;
  
  return exports;
});
