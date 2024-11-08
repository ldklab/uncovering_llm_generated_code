// jsonfile.js

const fs = require('fs');

function readFile(filename, options = {}, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  const { throws = true, reviver, ...fsOptions } = options;

  fs.readFile(filename, fsOptions, (err, data) => {
    if (err) return callback(err);

    try {
      const obj = JSON.parse(data, reviver);
      callback(null, obj);
    } catch (err) {
      if (throws) return callback(err);
      callback(null, null);
    }
  });
}

readFile.promises = function(filename, options) {
  return new Promise((resolve, reject) => {
    readFile(filename, options, (err, obj) => {
      if (err) return reject(err);
      resolve(obj);
    });
  });
};

function readFileSync(filename, options = {}) {
  const { throws = true, reviver, ...fsOptions } = options;

  try {
    const data = fs.readFileSync(filename, fsOptions);
    return JSON.parse(data, reviver);
  } catch (err) {
    if (throws) throw err;
    return null;
  }
}

function writeFile(filename, obj, options = {}, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  const { replacer, spaces, EOL = '\n', finalEOL = true, ...fsOptions } = options;
  let json = JSON.stringify(obj, replacer, spaces);
  if (finalEOL) json += EOL;

  fs.writeFile(filename, json, fsOptions, callback);
}

writeFile.promises = function(filename, obj, options) {
  return new Promise((resolve, reject) => {
    writeFile(filename, obj, options, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

function writeFileSync(filename, obj, options = {}) {
  const { replacer, spaces, EOL = '\n', finalEOL = true, ...fsOptions } = options;
  let json = JSON.stringify(obj, replacer, spaces);
  if (finalEOL) json += EOL;

  fs.writeFileSync(filename, json, fsOptions);
}

module.exports = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
  readFilePromise: readFile.promises,
  writeFilePromise: writeFile.promises
};
