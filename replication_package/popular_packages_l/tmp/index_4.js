const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const tempFiles = [];
const defaultOptions = {
  dir: os.tmpdir(),
  mode: 0o600,
  prefix: 'tmp-',
  postfix: '',
  keep: false,
  tries: 3,
};

function generateRandomHex() {
  return crypto.randomBytes(3).toString('hex');
}

function generateTempNameSync(options = {}) {
  const opts = { ...defaultOptions, ...options };
  for (let attempt = 0; attempt < opts.tries; attempt++) {
    const filename = path.join(opts.dir, `${opts.prefix}${generateRandomHex()}${opts.postfix}`);
    if (!fs.existsSync(filename)) {
      return filename;
    }
  }
  throw new Error('Unable to generate a unique temporary filename');
}

function createTempFileSync(options = {}) {
  const tempName = generateTempNameSync(options);
  const fileDescriptor = fs.openSync(tempName, 'w', options.mode || 0o600);
  const cleanupFunction = () => {
    try {
      fs.closeSync(fileDescriptor);
    } catch (error) {}
    try {
      if (!options.keep) fs.unlinkSync(tempName);
    } catch (error) {}
  };

  if (!options.keep) {
    tempFiles.push(cleanupFunction);
  }

  return { name: tempName, fd: fileDescriptor, cleanupCallback: cleanupFunction };
}

function createTempDirSync(options = {}) {
  const dirName = generateTempNameSync(options);
  fs.mkdirSync(dirName, { mode: options.mode || 0o700 });
  const cleanupFunction = () => {
    try {
      fs.rmdirSync(dirName, { recursive: options.unsafeCleanup || false });
    } catch (error) {}
  };

  if (!options.keep) {
    tempFiles.push(cleanupFunction);
  }

  return { name: dirName, cleanupCallback: cleanupFunction };
}

function enableGracefulCleanup() {
  process.on('exit', () => {
    tempFiles.forEach(callback => callback());
  });
}

module.exports = {
  fileSync: createTempFileSync,
  dirSync: createTempDirSync,
  tmpNameSync: generateTempNameSync,
  setGracefulCleanup: enableGracefulCleanup,
};

// Example usage:
const tmp = require('./tmp');  // Import the module
tmp.setGracefulCleanup();

const tempFile = tmp.fileSync();
console.log('Temp file created at:', tempFile.name);
tempFile.cleanupCallback();

const tempDir = tmp.dirSync();
console.log('Temp directory created at:', tempDir.name);
tempDir.cleanupCallback();
