const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

let trackedFiles = [];
let trackedDirs = [];

function generateUniqueName(prefix = '', suffix = '', dir = os.tmpdir()) {
  const uniqueId = crypto.randomBytes(16).toString('hex');
  return path.join(dir, `${prefix}${uniqueId}${suffix}`);
}

function trackFile(filePath) {
  trackedFiles.push(filePath);
}

function trackDir(dirPath) {
  trackedDirs.push(dirPath);
}

function cleanupSync() {
  let filesDeleted = 0;
  let dirsDeleted = 0;

  trackedFiles.forEach(file => {
    try {
      fs.unlinkSync(file);
      filesDeleted++;
    } catch (err) {
      console.error(`Failed to delete file: ${file}`, err);
    }
  });

  trackedDirs.forEach(dir => {
    try {
      fs.rmdirSync(dir);
      dirsDeleted++;
    } catch (err) {
      console.error(`Failed to delete dir: ${dir}`, err);
    }
  });

  trackedFiles = [];
  trackedDirs = [];

  return { files: filesDeleted, dirs: dirsDeleted };
}

function cleanup(callback) {
  try {
    const result = cleanupSync();
    callback(null, result);
  } catch (err) {
    callback(err);
  }
}

function track() {
  process.on('exit', cleanupSync);
  return module.exports;
}

function open(options, callback) {
  const opts = typeof options === 'string' ? { prefix: options } : options;
  const filePath = generateUniqueName(opts.prefix, opts.suffix, opts.dir);
  fs.open(filePath, 'w', (err, fd) => {
    if (err) return callback(err);
    trackFile(filePath);
    callback(null, { path: filePath, fd });
  });
}

function openSync(options = {}) {
  const filePath = generateUniqueName(options.prefix, options.suffix, options.dir);
  const fd = fs.openSync(filePath, 'w');
  trackFile(filePath);
  return { path: filePath, fd };
}

function mkdir(options, callback) {
  const opts = typeof options === 'string' ? { prefix: options } : options;
  const dirPath = generateUniqueName(opts.prefix, opts.suffix, opts.dir);
  fs.mkdir(dirPath, err => {
    if (err) return callback(err);
    trackDir(dirPath);
    callback(null, dirPath);
  });
}

function mkdirSync(options = {}) {
  const dirPath = generateUniqueName(options.prefix, options.suffix, options.dir);
  fs.mkdirSync(dirPath);
  trackDir(dirPath);
  return dirPath;
}

function createWriteStream(options = {}) {
  const filePath = generateUniqueName(options.prefix, options.suffix, options.dir);
  const stream = fs.createWriteStream(filePath);
  stream.path = filePath;
  trackFile(filePath);
  return stream;
}

function path(options = {}) {
  return generateUniqueName(options.prefix, options.suffix, options.dir);
}

module.exports = {
  open,
  openSync,
  mkdir,
  mkdirSync,
  createWriteStream,
  path,
  track,
  cleanup,
  cleanupSync
};
