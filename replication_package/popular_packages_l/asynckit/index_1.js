// File: asyncKit.js
const asyncKit = {
  parallel: function (tasks, iterator, callback) {
    const isArray = Array.isArray(tasks);
    const taskKeys = isArray ? [...Array(tasks.length).keys()] : Object.keys(tasks);
    const totalTasks = taskKeys.length;
    let completed = 0;
    let errorFlag = false;
    const results = isArray ? [] : {};
    const abortHandlers = [];

    taskKeys.forEach((key) => {
      if (errorFlag) return;

      const handleAbort = iterator(tasks[key], key, (err, result) => {
        if (errorFlag) return;

        if (err) {
          errorFlag = true;
          abortHandlers.forEach((abort) => abort && abort());
          callback(err, results);
        } else {
          results[key] = result;
          completed += 1;
          if (completed === totalTasks) {
            callback(null, results);
          }
        }
      });

      if (typeof handleAbort === "function") {
        abortHandlers.push(handleAbort);
      }
    });
  },

  serial: function (tasks, iterator, callback) {
    const isArray = Array.isArray(tasks);
    const taskKeys = isArray ? [...Array(tasks.length).keys()] : Object.keys(tasks);
    const results = isArray ? [] : {};
    let index = 0;

    const iterateNext = (err, result) => {
      if (err || index === taskKeys.length) {
        callback(err, results);
        return;
      }

      if (index > 0) {
        results[taskKeys[index - 1]] = result;
      }

      const currentKey = taskKeys[index];
      iterator(tasks[currentKey], currentKey, iterateNext);
      index += 1;
    };

    iterateNext();
  }
};

module.exports = asyncKit;
