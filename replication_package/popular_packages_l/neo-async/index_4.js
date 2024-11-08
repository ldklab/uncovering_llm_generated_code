function each(collection, iteratee, callback) {
  const length = collection.length;
  let processed = 0;

  if (length === 0) {
    return callback(null);
  }

  collection.forEach(item => {
    iteratee(item, err => {
      if (err) {
        callback(err);
        callback = () => {}; // no-operation to prevent subsequent calls
      } else {
        processed++;
        if (processed === length) {
          callback(null);
        }
      }
    });
  });
}

function eachSeries(collection, iteratee, callback) {
  const length = collection.length;
  let index = 0;

  const next = () => {
    if (index < length) {
      iteratee(collection[index], err => {
        if (err) {
          callback(err);
        } else {
          index++;
          next();
        }
      });
    } else {
      callback(null);
    }
  };

  next();
}

function parallel(tasks, callback) {
  const results = [];
  let done = 0;

  if (tasks.length === 0) {
    return callback(null, results);
  }

  tasks.forEach((task, i) => {
    task((err, result) => {
      if (err) {
        callback(err);
        callback = () => {}; // no-operation to handle the initial error
      } else {
        results[i] = result;
        done++;
        if (done === tasks.length) {
          callback(null, results);
        }
      }
    });
  });
}

// Example usages:
each([1, 2, 3], (item, cb) => {
  setTimeout(() => {
    console.log(item);
    cb(null);
  }, 100);
}, (err) => {
  if (err) console.error(err);
  else console.log('Completed each');
});

eachSeries([1, 2, 3], (item, cb) => {
  setTimeout(() => {
    console.log(item);
    cb(null);
  }, 100);
}, (err) => {
  if (err) console.error(err);
  else console.log('Completed eachSeries');
});

parallel([
  (cb) => {
    setTimeout(() => {
      cb(null, 'one');
    }, 200);
  },
  (cb) => {
    setTimeout(() => {
      cb(null, 'two');
    }, 100);
  }
], (err, results) => {
  if (err) console.error(err);
  else console.log(results); // ['one', 'two']
});
