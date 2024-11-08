const queueMicrotask = require('queue-microtask');

module.exports = runParallel;

function runParallel(tasks, callback) {
  let results, pending, keys;
  let isSync = true;

  const isArray = Array.isArray(tasks);
  
  if (isArray) {
    results = [];
    pending = tasks.length;
  } else {
    keys = Object.keys(tasks);
    results = {};
    pending = keys.length;
  }

  function done(error) {
    function callbackWrapper() {
      if (callback) callback(error, results);
      callback = null;
    }

    if (isSync) queueMicrotask(callbackWrapper);
    else callbackWrapper();
  }

  function taskComplete(index, error, result) {
    results[index] = result;
    if (error || --pending === 0) {
      done(error);
    }
  }

  if (pending === 0) {
    done(null);
  } else if (keys) {
    keys.forEach(key => {
      tasks[key]((error, result) => taskComplete(key, error, result));
    });
  } else {
    tasks.forEach((task, index) => {
      task((error, result) => taskComplete(index, error, result));
    });
  }

  isSync = false;
}
