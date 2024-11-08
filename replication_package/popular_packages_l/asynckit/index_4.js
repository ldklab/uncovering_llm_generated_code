// File: asyncKit.js
const asyncOperations = {
  parallel: function(collection, asyncTask, onComplete) {
    const keys = Array.isArray(collection) ? collection.map((_, index) => index) : Object.keys(collection);
    const total = keys.length;
    const results = Array.isArray(collection) ? [] : {};
    let finished = 0;
    let hasError = false;
    const cancelTasks = [];

    keys.forEach(key => {
      if (hasError) return;

      const item = collection[key];
      const cancelTask = asyncTask(item, key, (error, result) => {
        if (hasError) return;

        finished++;
        if (error) {
          hasError = true;
          cancelTasks.forEach(cancel => cancel && cancel());
          onComplete(error, results);
        } else {
          results[key] = result;
          if (finished === total) {
            onComplete(null, results);
          }
        }
      });

      if (typeof cancelTask === "function") {
        cancelTasks.push(cancelTask);
      }
    });
  },

  serial: function(collection, asyncTask, onComplete) {
    const keys = Array.isArray(collection) ? collection.map((_, index) => index) : Object.keys(collection);
    const results = Array.isArray(collection) ? [] : {};
    let index = 0;
    const total = keys.length;

    function proceed(error, result) {
      if (error || index === total) {
        onComplete(error, results);
        return;
      }

      if (index > 0) results[keys[index - 1]] = result;

      const key = keys[index++];
      const item = collection[key];

      asyncTask(item, key, proceed);
    }
    
    proceed();
  }
};

// Export the package functionalities
module.exports = asyncOperations;
