let fsModule;
try {
  fsModule = require('graceful-fs');
} catch (_) {
  fsModule = require('fs');
}
const universalify = require('universalify');
const { stringify, stripBom } = require('./utils');

async function readFileAsync(file, options = {}) {
  if (typeof options === 'string') options = { encoding: options };
  const fs = options.fs || fsModule;
  const shouldThrow = 'throws' in options ? options.throws : true;
  let data;

  data = stripBom(await universalify.fromCallback(fs.readFile)(file, options));

  try {
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
  if (typeof options === 'string') options = { encoding: options };
  const fs = options.fs || fsModule;
  const shouldThrow = 'throws' in options ? options.throws : true;

  try {
    let data = stripBom(fs.readFileSync(file, options));
    return JSON.parse(data, options.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`;
      throw err;
    }
    return null;
  }
}

async function writeFileAsync(file, data, options = {}) {
  const fs = options.fs || fsModule;
  const dataStr = stringify(data, options);
  await universalify.fromCallback(fs.writeFile)(file, dataStr, options);
}

const writeFile = universalify.fromPromise(writeFileAsync);

function writeFileSync(file, data, options = {}) {
  const fs = options.fs || fsModule;
  const dataStr = stringify(data, options);
  fs.writeFileSync(file, dataStr, options);
}

module.exports = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
};
