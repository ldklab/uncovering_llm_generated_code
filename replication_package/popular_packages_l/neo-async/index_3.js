function each(collection, iteratee, finalCallback) {
  const total = collection.length;
  let completed = 0;

  if (total === 0) return finalCallback(null);
  
  collection.forEach(item => {
    iteratee(item, err => {
      if (err) {
        finalCallback(err);
        finalCallback = () => {}; // Prevent further calls
      } else {
        completed++;
        if (completed === total) finalCallback(null);
      }
    });
  });
}

function eachSeries(collection, iteratee, finalCallback) {
  const total = collection.length;
  let index = 0;

  function iterate() {
    if (index >= total) return finalCallback(null);
    
    iteratee(collection[index], err => {
      if (err) return finalCallback(err);
      index++;
      iterate();
    });
  }

  iterate();
}

function parallel(tasks, finalCallback) {
  const results = [];
  const total = tasks.length;
  let completed = 0;

  if (total === 0) return finalCallback(null, results);

  tasks.forEach((task, idx) => {
    task((err, result) => {
      if (err) {
        finalCallback(err);
        finalCallback = () => {}; // Prevent further calls
      } else {
        results[idx] = result;
        completed++;
        if (completed === total) finalCallback(null, results);
      }
    });
  });
}

// Usage examples:

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
//   if (err) console.error(err);
//   else console.log(results); // ['one', 'two']
// });
