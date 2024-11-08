const fs = require('fs');
const path = require('path');

class AsyncUtil {
  static forEachOf(obj, iteratee, callback) {
    const keys = Object.keys(obj);
    let completed = 0;
    const length = keys.length;

    const done = (err) => {
      if (err) {
        callback(err);
        callback = () => {}; // prevent further callbacks
      } else if (++completed === length) {
        callback(null);
      }
    };

    keys.forEach((key) => {
      iteratee(obj[key], key, done);
    });
  }

  static async mapLimit(arr, limit, asyncIteratee, callback) {
    const results = [];
    let index = 0;
    let active = 0;

    const next = async () => {
      if (index === arr.length && active === 0) {
        return callback(null, results);
      }

      while (active < limit && index < arr.length) {
        const currentIndex = index++;
        active++;
        asyncIteratee(arr[currentIndex])
          .then((result) => {
            results[currentIndex] = result;
            active--;
            next();
          })
          .catch((err) => {
            callback(err);
            callback = () => {}; // prevent further callbacks
          });
      }
    };

    next();
  }
}

// Example of forEachOf usage
const obj = { dev: '/dev.json', test: '/test.json', prod: '/prod.json' };
const configs = {};

AsyncUtil.forEachOf(obj, (value, key, callback) => {
  fs.readFile(path.join(__dirname, value), 'utf8', (err, data) => {
    if (err) return callback(err);
    try {
      configs[key] = JSON.parse(data);
    } catch (e) {
      return callback(e);
    }
    callback();
  });
}, (err) => {
  if (err) console.error(err.message);
  else console.log('Configs loaded:', configs);
});

// Example of mapLimit usage
const urls = ['http://example.com/1', 'http://example.com/2', 'http://example.com/3'];
AsyncUtil.mapLimit(urls, 5, async (url) => {
  const response = await fetch(url); 
  return response.text();
}, (err, results) => {
  if (err) console.error(err);
  else console.log('Fetched results:', results);
});
