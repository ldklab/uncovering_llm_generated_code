(function(global, factory) {
  'use strict';
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    global.asyncLib = factory();
  }
})(this, function() {
  'use strict';

  const noop = () => {};
  const throwError = () => { throw new Error('Callback was already called.'); };
  
  // Utility for handling collections
  const arrayOrObject = coll => Array.isArray(coll) || typeof coll === 'object';
  const iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;
  
  // Async control functions
  const each = (coll, task, callback = noop) => {
    const isArray = Array.isArray(coll);
    const keys = isArray ? coll : Object.keys(coll);
    const length = keys.length;
    let completed = 0;
    
    if (!length) return callback(null);

    const done = (err) => {
      if (err) {
        callback = throwError;
        callback(err);
      } else if (++completed === length) {
        callback(null);
      }
    };

    keys.forEach((key) => {
      task(isArray ? key : coll[key], isArray ? done : (err) => done(err), isArray ? null : key);
    });
  };

  const eachSeries = (coll, task, callback = noop) => {
    const isArray = Array.isArray(coll);
    const keys = isArray ? coll : Object.keys(coll);
    const length = keys.length;
    
    if (!length) return callback(null);

    let index = 0;
    const iterate = () => {
      task(isArray ? keys[index] : coll[keys[index]], (err) => {
        if (err) return callback(err);
        if (++index >= length) return callback(null);
        iterate();
      }, isArray ? null : keys[index]);
    };
    
    iterate();
  };

  const map = (coll, task, callback = noop) => {
    const isArray = Array.isArray(coll);
    const keys = isArray ? coll : Object.keys(coll);
    const length = keys.length;
    let completed = 0;
    const results = isArray ? [] : {};

    if (!length) return callback(null, results);

    keys.forEach((key) => {
      task(isArray ? key : coll[key], (err, result) => {
        if (err) return callback(err);
        results[isArray ? results.length : key] = result;
        if (++completed === length) callback(null, results);
      }, isArray ? null : key);
    });
  };

  const parallel = (tasks, callback = noop) => {
    if (!Array.isArray(tasks)) return callback(new TypeError('Expected an array of tasks'));
    const results = [];
    let completed = 0;
    
    tasks.forEach((task, index) => {
      task((err, result) => {
        if (err) return callback(err);
        results[index] = result;
        if (++completed === tasks.length) callback(null, results);
      });
    });
  };

  const series = (tasks, callback = noop) => {
    if (!Array.isArray(tasks)) return callback(new TypeError('Expected an array of tasks'));
    const results = [];
    let index = 0;

    const iterate = () => {
      if (index === tasks.length) return callback(null, results);
      tasks[index]((err, result) => {
        if (err) return callback(err);
        results[index] = result;
        index++;
        iterate();
      });
    };

    iterate();
  };

  const waterfall = (tasks, callback = noop) => {
    if (!Array.isArray(tasks)) return callback(new TypeError('First argument must be an array of functions'));
    let index = 0;
    
    const wrapIterator = (iterator) => {
      return function(err, ...args) {
        if (err) return callback(err);
        const next = tasks[++index];
        if (!next) return callback(null, ...args);
        return args.length ? next(...args, wrapIterator(next)) : next(wrapIterator(next));
      };
    };

    if (tasks.length) tasks[index](wrapIterator(tasks[index]));
    else callback();
  };

  // Export
  return {
    each,
    eachSeries,
    map,
    parallel,
    series,
    waterfall
  };
});
