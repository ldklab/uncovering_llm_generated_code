function each(collection, iteratee, callback) {
  const length = collection.length;
  let completed = 0;

  if (length === 0) {
    return callback(null);
  }

  collection.forEach((item) => {
    iteratee(item, (err) => {
      if (err) {
        callback(err);
        callback = () => {};
      } else {
        completed += 1;
        if (completed === length) {
          callback(null);
        }
      }
    });
  });
}

function eachSeries(collection, iteratee, callback) {
  const length = collection.length;
  let index = 0;

  function iterate() {
    if (index < length) {
      iteratee(collection[index], (err) => {
        if (err) {
          callback(err);
        } else {
          index++;
          iterate();
        }
      });
    } else {
      callback(null);
    }
  }

  iterate();
}

function parallel(tasks, callback) {
  const results = [];
  let completed = 0;
  const total = tasks.length;

  if (total === 0) {
    return callback(null, results);
  }

  tasks.forEach((task, index) => {
    task((err, result) => {
      if (err) {
        callback(err);
        callback = () => {};
      } else {
        results[index] = result;
        completed += 1;
        if (completed === total) {
          callback(null, results);
        }
      }
    });
  });
}
