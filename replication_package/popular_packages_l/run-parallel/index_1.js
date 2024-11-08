function parallel(tasks, callback = () => {}) {
  if (typeof tasks !== 'object' || tasks === null) {
    throw new Error('First argument to parallel must be an object or array');
  }

  const isArray = Array.isArray(tasks);
  const results = isArray ? [] : {};
  const keys = Object.keys(tasks);
  let pendingTasks = keys.length;

  if (pendingTasks === 0) {
    return callback(null, results);
  }

  function handleTaskCompletion(indexOrKey, err, result) {
    if (err) {
      callback(err);
      callback = () => {}; // Ensures that callback is called only once
      return;
    }
    
    results[indexOrKey] = result;
    pendingTasks -= 1;

    if (pendingTasks === 0) {
      callback(null, results);
    }
  }

  keys.forEach((key, index) => {
    const task = tasks[key];
    try {
      task((err, result) => handleTaskCompletion(isArray ? index : key, err, result));
    } catch (err) {
      handleTaskCompletion(isArray ? index : key, err);
    }
  });
}

module.exports = parallel;

// Example usage:
parallel([
  callback => setTimeout(() => callback(null, 'one'), 200),
  callback => setTimeout(() => callback(null, 'two'), 100)
], (err, results) => {
  if (err) return console.error(err);
  console.log(results); // ['one', 'two']
});

parallel({
  task1: callback => setTimeout(() => callback(null, 'one'), 200),
  task2: callback => setTimeout(() => callback(null, 'two'), 100)
}, (err, results) => {
  if (err) return console.error(err);
  console.log(results); // { task1: 'one', task2: 'two' }
});
