// jsonfile.js

const fs = require('fs');
const path = require('path');

function readFile(filePath, options = {}, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const { throws = true, reviver, ...fsOptions } = options;

  fs.readFile(filePath, fsOptions, (err, data) => {
    if (err) return callback(err);
    try {
      const parsedData = JSON.parse(data, reviver);
      callback(null, parsedData);
    } catch (parseErr) {
      return throws ? callback(parseErr) : callback(null, null);
    }
  });
}

function readFileSync(filePath, options = {}) {
  const { throws = true, reviver, ...fsOptions } = options;
  try {
    const data = fs.readFileSync(filePath, fsOptions);
    return JSON.parse(data, reviver);
  } catch (err) {
    if (throws) throw err;
    return null;
  }
}

function writeFile(filePath, obj, options = {}, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const { replacer, spaces, EOL = '\n', finalEOL = true, ...fsOptions } = options;
  
  let jsonData = JSON.stringify(obj, replacer, spaces);
  if (finalEOL) jsonData += EOL;

  fs.writeFile(filePath, jsonData, fsOptions, callback);
}

function writeFileSync(filePath, obj, options = {}) {
  const { replacer, spaces, EOL = '\n', finalEOL = true, ...fsOptions } = options;
  
  let jsonData = JSON.stringify(obj, replacer, spaces);
  if (finalEOL) jsonData += EOL;

  fs.writeFileSync(filePath, jsonData, fsOptions);
}

readFile.promises = function (filePath, options) {
  return new Promise((resolve, reject) => {
    readFile(filePath, options, (err, obj) => {
      if (err) return reject(err);
      resolve(obj);
    });
  });
};

writeFile.promises = function (filePath, obj, options) {
  return new Promise((resolve, reject) => {
    writeFile(filePath, obj, options, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
  readFilePromise: readFile.promises,
  writeFilePromise: writeFile.promises,
};
