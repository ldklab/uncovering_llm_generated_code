function parallel(tasks, callback) {
  if (typeof tasks !== 'object' || tasks === null) {
    throw new Error('First argument to parallel must be an object or array');
  }

  callback = callback || function () {};

  const isArray = Array.isArray(tasks);
  const results = isArray ? [] : {};
  const keys = Object.keys(tasks);
  let remaining = keys.length;

  if (remaining === 0) {
    return process.nextTick(() => callback(null, results));
  }

  function taskCallback(indexOrKey, err, result) {
    if (callback === null) return;

    if (err) {
      const currentCallback = callback;
      callback = null; // Prevent further calls
      return currentCallback(err);
    }

    results[indexOrKey] = result;
    remaining -= 1;

    if (remaining === 0) {
      const currentCallback = callback;
      callback = null; // Prevent further calls
      currentCallback(null, results);
    }
  }

  keys.forEach((key, index) => {
    const task = tasks[key];
    
    if (typeof task !== 'function') {
      taskCallback(isArray ? index : key, new Error(`Task at ${key} is not a function`));
      return;
    }

    try {
      task((err, result) => taskCallback(isArray ? index : key, err, result));
    } catch (err) {
      taskCallback(isArray ? index : key, err);
    }
  });
}

module.exports = parallel;

// Example usage:
parallel([
  function (callback) {
    setTimeout(() => callback(null, 'one'), 200);
  },
  function (callback) {
    setTimeout(() => callback(null, 'two'), 100);
  }
], function (err, results) {
  if (err) {
    return console.error(err);
  }
  console.log(results); // ['one', 'two']
});

parallel({
  task1: function (callback) {
    setTimeout(() => callback(null, 'one'), 200);
  },
  task2: function (callback) {
    setTimeout(() => callback(null, 'two'), 100);
  }
}, function (err, results) {
  if (err) {
    return console.error(err);
  }
  console.log(results); // { task1: 'one', task2: 'two' }
});
