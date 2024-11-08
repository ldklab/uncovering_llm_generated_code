module.exports = runParallel;

function runParallel(tasks, callback) {
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

  if (!pending) {
    process.nextTick(() => callback(null, results));
    return;
  }

  const done = (error) => {
    const complete = () => {
      if (callback) callback(error, results);
      callback = null;
    };
    if (isSync) process.nextTick(complete);
    else complete();
  };

  const handleResult = (index, error, result) => {
    results[index] = result;
    if (--pending === 0 || error) {
      done(error);
    }
  };

  if (keys) {
    keys.forEach((key) => {
      tasks[key]((error, result) => handleResult(key, error, result));
    });
  } else {
    tasks.forEach((task, index) => {
      task((error, result) => handleResult(index, error, result));
    });
  }

  isSync = false;
}
