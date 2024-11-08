function each(collection, iteratee, callback) {
  const length = collection.length;
  let completed = 0;

  if (length === 0) {
    return callback(null);
  }

  for (let i = 0; i < length; i++) {
    iteratee(collection[i], err => {
      if (err) {
        callback(err);
        callback = function() {}; // noop
      } else {
        completed += 1;
        if (completed === length) {
          callback(null);
        }
      }
    });
  }
}

function eachSeries(collection, iteratee, callback) {
  const length = collection.length;
  let index = 0;
  
  function iterate() {
    if (index < length) {
      iteratee(collection[index], err => {
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
        callback = function() {}; // noop
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

// Usage:
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
//   function(callback) {
//     setTimeout(() => {
//       callback(null, 'one');
//     }, 200);
//   },
//   function(callback) {
//     setTimeout(() => {
//       callback(null, 'two');
//     }, 100);
//   }
// ], (err, results) => {
//   console.log(results); // results is now ['one', 'two'] even though the second function had a shorter timeout.
// });
```
```