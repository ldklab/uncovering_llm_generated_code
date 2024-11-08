(function(global, factory) {
  'use strict';
  if (typeof module === 'object' && typeof exports === 'object') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory(global.async = {});
  }
})(this, function(exports) {
  'use strict';

  function noop() {}

  // Example definition for an async iteration function
  function each(arr, iterator, callback = noop) {
    let completed = 0;
    for (let i = 0; i < arr.length; i++) {
      iterator(arr[i], (err) => {
        if (err) callback(err);
        else if (++completed === arr.length) callback(null);
      });
    }
  }

  // Example of a control flow function
  function series(tasks, callback) {
    let result = [];
    (function iterate(index) {
      if (index === tasks.length) return callback(null, result);
      tasks[index](function(err, res) {
        if (err) return callback(err);
        result.push(res);
        iterate(index + 1);
      });
    })(0);
  }

  // Example of a utility function
  function times(n, iterator, callback) {
    let results = [], completed = 0;
    for (let i = 0; i < n; i++) {
      iterator(i, (err, result) => {
        if (err) return callback(err);
        results[i] = result;
        if (++completed === n) callback(null, results);
      });
    }
  }

  exports.each = each;
  exports.series = series;
  exports.times = times;
});
