let fsModule;

try {
  fsModule = require('graceful-fs');
} catch (_) {
  fsModule = require('fs');
}

const universalify = require('universalify');
const { stringify, stripBom } = require('./utils');

async function readFileAsync(file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  const fs = options.fs || fsModule;
  const shouldThrow = 'throws' in options ? options.throws : true;

  try {
    let data = await universalify.fromCallback(fs.readFile)(file, options);
    data = stripBom(data);
    return JSON.parse(data, options.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`;
      throw err;
    }
    return null;
  }
}

const readFile = universalify.fromPromise(readFileAsync);

function readFileSync(file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  const fs = options.fs || fsModule;
  const shouldThrow = 'throws' in options ? options.throws : true;

  try {
    let data = fs.readFileSync(file, options);
    data = stripBom(data);
    return JSON.parse(data, options.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`;
      throw err;
    }
    return null;
  }
}

async function writeFileAsync(file, obj, options = {}) {
  const fs = options.fs || fsModule;
  const jsonStr = stringify(obj, options);
  await universalify.fromCallback(fs.writeFile)(file, jsonStr, options);
}

const writeFile = universalify.fromPromise(writeFileAsync);

function writeFileSync(file, obj, options = {}) {
  const fs = options.fs || fsModule;
  const jsonStr = stringify(obj, options);
  fs.writeFileSync(file, jsonStr, options);
}

const jsonFileAPI = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
};

module.exports = jsonFileAPI;
