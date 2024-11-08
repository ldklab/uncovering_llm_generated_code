const fs = require('fs');

function processFileOptions(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  return { options: options || {}, callback };
}

function readFile(filename, options, callback) {
  const { options: opts, callback: cb } = processFileOptions(options, callback);
  const { throws = true, reviver, ...fsOptions } = opts;

  fs.readFile(filename, fsOptions, (err, data) => {
    if (err) return cb(err);

    try {
      const obj = JSON.parse(data, reviver);
      cb(null, obj);
    } catch (parsingErr) {
      if (throws) return cb(parsingErr);
      cb(null, null);
    }
  });
}

readFile.promises = function (filename, options) {
  return new Promise((resolve, reject) => {
    readFile(filename, options, (err, obj) => {
      if (err) reject(err);
      else resolve(obj);
    });
  });
};

function readFileSync(filename, options = {}) {
  const { throws = true, reviver, ...fsOptions } = options;

  try {
    const data = fs.readFileSync(filename, fsOptions);
    return JSON.parse(data, reviver);
  } catch (error) {
    if (throws) throw error;
    return null;
  }
}

function writeFile(filename, obj, options, callback) {
  const { options: opts, callback: cb } = processFileOptions(options, callback);
  const { replacer, spaces, EOL = '\n', finalEOL = true, ...fsOptions } = opts;

  let json = JSON.stringify(obj, replacer, spaces);
  if (finalEOL) json += EOL;

  fs.writeFile(filename, json, fsOptions, cb);
}

writeFile.promises = function (filename, obj, options) {
  return new Promise((resolve, reject) => {
    writeFile(filename, obj, options, err => {
      if (err) reject(err);
      else resolve();
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
