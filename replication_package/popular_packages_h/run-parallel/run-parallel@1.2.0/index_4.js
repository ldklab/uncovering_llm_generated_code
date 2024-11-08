const queueMicrotask = require('queue-microtask');

function runParallel(tasks, callback) {
  let results, pendingTasks, taskKeys;
  let isSynchronous = true;

  if (Array.isArray(tasks)) {
    results = [];
    pendingTasks = tasks.length;
  } else {
    taskKeys = Object.keys(tasks);
    results = {};
    pendingTasks = taskKeys.length;
  }

  function finalize(err) {
    function conclude() {
      if (callback) callback(err, results);
      callback = null;
    }
    if (isSynchronous) queueMicrotask(conclude);
    else conclude();
  }

  function taskCallback(index, err, result) {
    results[index] = result;
    if (--pendingTasks === 0 || err) {
      finalize(err);
    }
  }

  if (!pendingTasks) {
    finalize(null);
  } else if (taskKeys) {
    taskKeys.forEach((key) => {
      tasks[key]((err, result) => taskCallback(key, err, result));
    });
  } else {
    tasks.forEach((task, index) => {
      task((err, result) => taskCallback(index, err, result));
    });
  }

  isSynchronous = false;
}

module.exports = runParallel;
