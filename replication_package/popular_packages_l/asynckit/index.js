// File: index.js
const asyncKit = {
  parallel: function(input, iterator, finalCallback) {
    const keys = Array.isArray(input) ? input.map((_, i) => i) : Object.keys(input);
    const totalJobs = keys.length;
    const results = Array.isArray(input) ? [] : {};
    let completedJobs = 0;
    let errorOccurred = false;
    const abortFns = [];

    keys.forEach(key => {
      if (errorOccurred) return;

      const item = input[key];
      const abortFn = iterator(item, key, (err, result) => {
        if (errorOccurred) return;

        completedJobs++;
        if (err) {
          errorOccurred = true;
          abortFns.forEach(fn => fn && fn());
          finalCallback(err, results);
        } else {
          results[key] = result;
          if (completedJobs === totalJobs) {
            finalCallback(null, results);
          }
        }
      });

      if (typeof abortFn === "function") {
        abortFns.push(abortFn);
      }
    });
  },

  serial: function(input, iterator, finalCallback) {
    const keys = Array.isArray(input) ? input.map((_, i) => i) : Object.keys(input);
    const results = Array.isArray(input) ? [] : {};
    let currentIndex = 0;
    const totalJobs = keys.length;

    function next(err, result) {
      if (err || currentIndex === totalJobs) {
        finalCallback(err, results);
        return;
      }

      if (currentIndex > 0) results[keys[currentIndex - 1]] = result;

      const currentKey = keys[currentIndex++];
      const currentItem = input[currentKey];

      iterator(currentItem, currentKey, next);
    }
    
    next();
  }
};

// Export the package functionalities
module.exports = asyncKit;
