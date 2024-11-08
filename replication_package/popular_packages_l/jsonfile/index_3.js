const fs = require('fs');

const readFile = (filename, options = {}, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const { throws = true, reviver, ...fsOptions } = options;

  fs.readFile(filename, fsOptions, (err, data) => {
    if (err) return callback(err);
    try {
      callback(null, JSON.parse(data, reviver));
    } catch (err) {
      callback(throws ? err : null, throws ? null : null);
    }
  });
};

readFile.promises = (filename, options) =>
  new Promise((resolve, reject) => {
    readFile(filename, options, (err, obj) => (err ? reject(err) : resolve(obj)));
  });

const readFileSync = (filename, options = {}) => {
  const { throws = true, reviver, ...fsOptions } = options;
  try {
    const data = fs.readFileSync(filename, fsOptions);
    return JSON.parse(data, reviver);
  } catch (err) {
    if (throws) throw err;
    return null;
  }
};

const writeFile = (filename, obj, options = {}, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const { replacer, spaces, EOL = '\n', finalEOL = true, ...fsOptions } = options;
  let json = JSON.stringify(obj, replacer, spaces) + (finalEOL ? EOL : '');

  fs.writeFile(filename, json, fsOptions, callback);
};

writeFile.promises = (filename, obj, options) =>
  new Promise((resolve, reject) => {
    writeFile(filename, obj, options, (err) => (err ? reject(err) : resolve()));
  });

const writeFileSync = (filename, obj, options = {}) => {
  const { replacer, spaces, EOL = '\n', finalEOL = true, ...fsOptions } = options;
  let json = JSON.stringify(obj, replacer, spaces) + (finalEOL ? EOL : '');
  fs.writeFileSync(filename, json, fsOptions);
};

module.exports = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
  readFilePromise: readFile.promises,
  writeFilePromise: writeFile.promises
};
