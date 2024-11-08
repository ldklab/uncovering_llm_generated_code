function each(collection, iteratee, callback) {
  let completed = 0;
  const length = collection.length;

  if (length === 0) {
    return callback(null);
  }

  collection.forEach(item => {
    iteratee(item, err => {
      if (err) {
        callback(err);
        callback = () => {};  // Disable further calls of the callback
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

  const iterate = () => {
    if (index < length) {
      iteratee(collection[index], err => {
        if (err) {
          callback(err);
        } else {
          index += 1;
          iterate();
        }
      });
    } else {
      callback(null);
    }
  };

  iterate();
}

function parallel(tasks, callback) {
  const results = [];
  const total = tasks.length;
  let completed = 0;

  if (total === 0) {
    return callback(null, results);
  }

  tasks.forEach((task, index) => {
    task((err, result) => {
      if (err) {
        callback(err);
        callback = () => {};  // Disable further calls of the callback
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

// Usage Example:

// each([1, 2, 3], (item, callback) => {
//   setTimeout(() => {
//     console.log(item);
//     callback(null);
//   }, 100);
// }, (err) => {
//   if (err) console.error(err);
//   else console.log('Completed each');
// });

// eachSeries([1, 2, 3], (item, callback) => {
//   setTimeout(() => {
//     console.log(item);
//     callback(null);
//   }, 100);
// }, (err) => {
//   if (err) console.error(err);
//   else console.log('Completed eachSeries');
// });

// parallel([
//   (callback) => {
//     setTimeout(() => {
//       callback(null, 'one');
//     }, 200);
//   },
//   (callback) => {
//     setTimeout(() => {
//       callback(null, 'two');
//     }, 100);
//   }
// ], (err, results) => {
//   console.log(results); // results will be ['one', 'two']
// });
