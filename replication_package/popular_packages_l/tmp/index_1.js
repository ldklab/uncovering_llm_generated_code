const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const tempFiles = [];
const optionsDefaults = {
  dir: os.tmpdir(),
  mode: 0o600,
  prefix: 'tmp-',
  postfix: '',
  keep: false,
  tries: 3,
};

function randomChars() {
  return crypto.randomBytes(3).toString('hex');
}

function tmpNameSync(options = {}) {
  const opts = { ...optionsDefaults, ...options };
  for (let i = 0; i < opts.tries; i++) {
    const name = path.join(opts.dir, opts.prefix + randomChars() + opts.postfix);
    if (!fs.existsSync(name)) {
      return name;
    }
  }
  throw new Error('Could not generate a unique tmp filename');
}

function fileSync(options = {}) {
  const name = tmpNameSync(options);
  const fd = fs.openSync(name, 'w', options.mode || 0o600);
  const cleanupCallback = () => {
    try {
      fs.closeSync(fd);
    } catch (err) {}
    try {
      if (!options.keep) fs.unlinkSync(name);
    } catch (err) {}
  };

  if (!options.keep) {
    tempFiles.push(cleanupCallback);
  }

  return { name, fd, cleanupCallback };
}

function dirSync(options = {}) {
  const name = tmpNameSync(options);
  fs.mkdirSync(name, options.mode || 0o700);
  const cleanupCallback = () => {
    try {
      fs.rmdirSync(name, { recursive: options.unsafeCleanup || false });
    } catch (err) {}
  };

  if (!options.keep) {
    tempFiles.push(cleanupCallback);
  }

  return { name, cleanupCallback };
}

function setGracefulCleanup() {
  process.on('exit', () => {
    tempFiles.forEach(callback => callback());
  });
}

module.exports = {
  fileSync,
  dirSync,
  tmpNameSync,
  setGracefulCleanup,
};

// Example usage
const tmp = require('./tmp');
tmp.setGracefulCleanup();

const tmpfile = tmp.fileSync();
console.log('Temp file created at:', tmpfile.name);
tmpfile.cleanupCallback();

const tmpdir = tmp.dirSync();
console.log('Temp directory created at:', tmpdir.name);
tmpdir.cleanupCallback();
