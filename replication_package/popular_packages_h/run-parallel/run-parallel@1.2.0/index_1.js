module.exports = runParallel;

const queueMicrotask = require('queue-microtask');

function runParallel(tasks, cb) {
  let results, pending, keys;
  let isSync = true;

  if (Array.isArray(tasks)) {
    results = [];
    pending = tasks.length;
  } else {
    keys = Object.keys(tasks);
    results = {};
    pending = keys.length;
  }

  function done(err) {
    const finish = () => {
      if (cb) cb(err, results);
      cb = null;
    };
    if (isSync) queueMicrotask(finish);
    else finish();
  }

  function each(i, err, result) {
    results[i] = result;
    if (--pending === 0 || err) {
      done(err);
    }
  }

  if (!pending) {
    done(null);
  } else if (keys) {
    keys.forEach(key => {
      tasks[key]((err, result) => each(key, err, result));
    });
  } else {
    tasks.forEach((task, i) => {
      task((err, result) => each(i, err, result));
    });
  }

  isSync = false;
}
