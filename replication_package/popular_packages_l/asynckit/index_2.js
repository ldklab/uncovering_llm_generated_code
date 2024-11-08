// File: index.js
const asyncKit = {
  parallel: function(input, iterator, finalCallback) {
    const isArray = Array.isArray(input);
    const keys = isArray ? input.map((_, i) => i) : Object.keys(input);
    const totalJobs = keys.length;
    const results = isArray ? [] : {};
    let completed = 0;
    let hasError = false;
    const abortFunctions = [];

    keys.forEach(key => {
      if (hasError) return;

      const item = input[key];
      const abortFn = iterator(item, key, (error, result) => {
        if (hasError) return;

        completed++;
        if (error) {
          hasError = true;
          abortFunctions.forEach(fn => fn && fn());
          finalCallback(error, results);
        } else {
          results[key] = result;
          if (completed === totalJobs) {
            finalCallback(null, results);
          }
        }
      });

      if (typeof abortFn === 'function') {
        abortFunctions.push(abortFn);
      }
    });
  },

  serial: function(input, iterator, finalCallback) {
    const isArray = Array.isArray(input);
    const keys = isArray ? input.map((_, i) => i) : Object.keys(input);
    const results = isArray ? [] : {};
    let index = 0;
    const totalJobs = keys.length;

    function iterate(err, result) {
      if (err || index === totalJobs) {
        finalCallback(err, results);
        return;
      }

      if (index > 0) {
        results[keys[index - 1]] = result;
      }

      const currentKey = keys[index++];
      const currentItem = input[currentKey];
      iterator(currentItem, currentKey, iterate);
    }

    iterate();
  }
};

// Export the package functionalities
module.exports = asyncKit;
