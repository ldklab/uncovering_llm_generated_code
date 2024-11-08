module.exports = runParallel;

function runParallel(tasks, cb) {
  let results = Array.isArray(tasks) ? [] : {};
  let keys = Array.isArray(tasks) ? null : Object.keys(tasks);
  let pending = keys ? keys.length : tasks.length;
  let isSync = true;

  function done(err) {
    if (cb) {
      if (isSync) {
        process.nextTick(() => cb(err, results));
      } else {
        cb(err, results);
      }
      cb = null;
    }
  }

  function each(index, err, result) {
    results[index] = result;
    if (err || --pending === 0) {
      done(err);
    }
  }

  if (!pending) {
    done(null);
  } else {
    const taskHandler = (keyOrIndex) => {
      tasks[keyOrIndex]((err, result) => each(keyOrIndex, err, result));
    };
    
    if (keys) {
      keys.forEach(taskHandler);
    } else {
      tasks.forEach((task, i) => taskHandler(i));
    }
  }

  isSync = false;
}
