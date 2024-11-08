let fsLib;
try {
  fsLib = require('graceful-fs');
} catch (_) {
  fsLib = require('fs');
}
const universalify = require('universalify');
const { stringify, stripBom } = require('./utils');

async function asyncReadFile(filePath, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  const fs = options.fs || fsLib;
  const shouldThrow = 'throws' in options ? options.throws : true;

  let fileData = await universalify.fromCallback(fs.readFile)(filePath, options);
  fileData = stripBom(fileData);

  try {
    return JSON.parse(fileData, options.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${filePath}: ${err.message}`;
      throw err;
    }
    return null;
  }
}

const readFile = universalify.fromPromise(asyncReadFile);

function syncReadFile(filePath, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  const fs = options.fs || fsLib;
  const shouldThrow = 'throws' in options ? options.throws : true;

  try {
    let fileContent = fs.readFileSync(filePath, options);
    fileContent = stripBom(fileContent);
    return JSON.parse(fileContent, options.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${filePath}: ${err.message}`;
      throw err;
    }
    return null;
  }
}

async function asyncWriteFile(filePath, jsonObject, options = {}) {
  const fs = options.fs || fsLib;
  const jsonString = stringify(jsonObject, options);

  await universalify.fromCallback(fs.writeFile)(filePath, jsonString, options);
}

const writeFile = universalify.fromPromise(asyncWriteFile);

function syncWriteFile(filePath, jsonObject, options = {}) {
  const fs = options.fs || fsLib;
  const jsonString = stringify(jsonObject, options);
  
  fs.writeFileSync(filePath, jsonString, options);
}

const jsonFileUtilities = {
  readFile,
  readFileSync: syncReadFile,
  writeFile,
  writeFileSync: syncWriteFile
};

module.exports = jsonFileUtilities;
