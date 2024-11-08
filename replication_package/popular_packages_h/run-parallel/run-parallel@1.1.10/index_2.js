module.exports = runParallel;

function runParallel(tasks, cb) {
  let results = Array.isArray(tasks) ? [] : {};
  let pending = Array.isArray(tasks) ? tasks.length : Object.keys(tasks).length;
  let isSync = true;
  let keys = !Array.isArray(tasks) ? Object.keys(tasks) : null;

  function done(err) {
    const end = () => {
      if (cb) cb(err, results);
      cb = null;
    };
    if (isSync) process.nextTick(end);
    else end();
  }

  function each(key, err, result) {
    results[key] = result;
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
