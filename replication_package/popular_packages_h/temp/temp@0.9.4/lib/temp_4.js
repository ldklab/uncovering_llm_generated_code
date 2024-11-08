const fs = require('fs');
const path = require('path');
const os = require('os');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const { constants } = require('constants');

const rimrafSync = rimraf.sync;

// Constants
const DIR = path.resolve(os.tmpdir());
const RDWR_EXCL = constants.O_CREAT | constants.O_TRUNC | constants.O_RDWR | constants.O_EXCL;

// Helper functions
const promisify = (callback) => {
  if (typeof callback === 'function') return [undefined, callback];
  
  let promiseCallback;
  const promise = new Promise((resolve, reject) => {
    promiseCallback = (...args) => {
      const err = args.shift();
      process.nextTick(() => (err ? reject(err) : resolve(args.length === 1 ? args[0] : args)));
    };
  });

  return [promise, promiseCallback];
};

const generateName = (rawAffixes, defaultPrefix) => {
  const affixes = parseAffixes(rawAffixes, defaultPrefix);
  const stamp = `${affixes.prefix}${new Date().toISOString().replace(/[^\d]/g, '')}-${process.pid}-${Math.random().toString(36).slice(2)}${affixes.suffix}`;
  return path.join(affixes.dir || DIR, stamp);
};

const parseAffixes = (rawAffixes, defaultPrefix) => {
  if (!rawAffixes) return { prefix: defaultPrefix, suffix: '' };

  if (typeof rawAffixes === 'string') return { prefix: rawAffixes, suffix: '' };
  if (typeof rawAffixes === 'object') return rawAffixes;
  throw new Error(`Unknown affix declaration: ${rawAffixes}`);
};

// Tracking and cleanup
let tracking = false;
let exitListenerAttached = false;
let filesToDelete = [];
let dirsToDelete = [];

const track = (value) => {
  tracking = value !== false;
  return module.exports;
};

const attachExitListener = () => {
  if (!tracking || exitListenerAttached) return;
  process.on('exit', () => {
    try {
      cleanupSync();
    } catch (err) {
      console.warn("Fail to clean temporary files on exit:", err);
    }
  });
  exitListenerAttached = true;
};

const deleteFileOnExit = (filePath) => {
  if (!tracking) return;
  attachExitListener();
  filesToDelete.push(filePath);
};

const deleteDirOnExit = (dirPath) => {
  if (!tracking) return;
  attachExitListener();
  dirsToDelete.push(dirPath);
};

const cleanupFilesSync = () => {
  if (!tracking) return;
  for (let file; (file = filesToDelete.shift()); ) rimrafSync(file, { maxBusyTries: 6 });
};

const cleanupDirsSync = () => {
  if (!tracking) return;
  for (let dir; (dir = dirsToDelete.shift()); ) rimrafSync(dir, { maxBusyTries: 6 });
};

const cleanupFiles = (callback) => {
  const [promise, cb] = promisify(callback);
  if (!tracking) return cb(new Error("not tracking"));

  let count = 0;
  const total = filesToDelete.length;

  if (!total) return cb(null, count);

  const rimrafCallback = (err) => {
    if (err) return cb(err);
    count++;
    if (!--total) cb(null, count);
  };

  filesToDelete.forEach((file) => rimraf(file, { maxBusyTries: 6 }, rimrafCallback));
  return promise;
};

const cleanupDirs = (callback) => {
  const [promise, cb] = promisify(callback);
  if (!tracking) return cb(new Error("not tracking"));

  let count = 0;
  const total = dirsToDelete.length;

  if (!total) return cb(null, count);

  const rimrafCallback = (err) => {
    if (err) return cb(err);
    count++;
    if (!--total) cb(null, count);
  };

  dirsToDelete.forEach((dir) => rimraf(dir, { maxBusyTries: 6 }, rimrafCallback));
  return promise;
};

const cleanupSync = () => {
  if (!tracking) return;
  return { files: cleanupFilesSync(), dirs: cleanupDirsSync() };
};

const cleanup = (callback) => {
  const [promise, cb] = promisify(callback);
  if (!tracking) return cb(new Error("not tracking"));

  cleanupFiles((fileErr, fileCount) => {
    if (fileErr) return cb(fileErr, { files: fileCount });
    cleanupDirs((dirErr, dirCount) => cb(dirErr, { files: fileCount, dirs: dirCount }));
  });

  return promise;
};

// Directory operations
const mkdir = (affixes, callback) => {
  const [promise, cb] = promisify(callback);
  const dirPath = generateName(affixes, 'd-');

  mkdirp(dirPath, { mode: 0o700 }, (err) => {
    if (!err) deleteDirOnExit(dirPath);
    cb(err, dirPath);
  });

  return promise;
};

const mkdirSync = (affixes) => {
  const dirPath = generateName(affixes, 'd-');
  mkdirp.sync(dirPath, { mode: 0o700 });
  deleteDirOnExit(dirPath);
  return dirPath;
};

// File operations
const open = (affixes, callback) => {
  const [promise, cb] = promisify(callback);
  const filePath = generateName(affixes, 'f-');

  fs.open(filePath, RDWR_EXCL, 0o600, (err, fd) => {
    if (!err) deleteFileOnExit(filePath);
    cb(err, { path: filePath, fd });
  });

  return promise;
};

const openSync = (affixes) => {
  const filePath = generateName(affixes, 'f-');
  const fd = fs.openSync(filePath, RDWR_EXCL, 0o600);
  deleteFileOnExit(filePath);
  return { path: filePath, fd };
};

const createWriteStream = (affixes) => {
  const filePath = generateName(affixes, 's-');
  const stream = fs.createWriteStream(filePath, { flags: RDWR_EXCL, mode: 0o600 });
  deleteFileOnExit(filePath);
  return stream;
};

// Exports
module.exports = {
  dir: DIR,
  mkdir,
  mkdirSync,
  open,
  openSync,
  path: generateName,
  cleanup,
  cleanupSync,
  createWriteStream,
  track,
};
