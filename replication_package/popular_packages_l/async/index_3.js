const fs = require('fs').promises;
const path = require('path');

class AsyncUtil {
  static async forEachOf(obj, iteratee) {
    const keys = Object.keys(obj);
    await Promise.all(keys.map(async key => {
      await iteratee(obj[key], key);
    }));
  }

  static async mapLimit(arr, limit, asyncIteratee) {
    const results = [];
    const executing = [];

    for (const item of arr) {
      const p = asyncIteratee(item).then(result => {
        results.push(result);
      });
      executing.push(p);

      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.indexOf(p), 1);
      }
    }

    await Promise.all(executing);

    return results;
  }
}

// Use forEachOf function
(async () => {
  const obj = { dev: '/dev.json', test: '/test.json', prod: '/prod.json' };
  const configs = {};

  try {
    await AsyncUtil.forEachOf(obj, async (value, key) => {
      const data = await fs.readFile(path.join(__dirname, value), 'utf8');
      configs[key] = JSON.parse(data);
    });

    console.log('Configs loaded:', configs);
  } catch (err) {
    console.error(err.message);
  }
})();

// Use mapLimit function
(async () => {
  const urls = ['http://example.com/1', 'http://example.com/2', 'http://example.com/3'];

  try {
    const fetch = require('node-fetch');
    const results = await AsyncUtil.mapLimit(urls, 5, async (url) => {
      const response = await fetch(url);
      return response.text();
    });

    console.log('Fetched results:', results);
  } catch (err) {
    console.error(err);
  }
})();
