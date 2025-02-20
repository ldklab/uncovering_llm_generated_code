const fs = require('fs');
const path = require('path');
const { O_CREAT, O_TRUNC, O_RDWR, O_EXCL } = require('constants');
const os = require('os');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const rimrafSync = rimraf.sync;

const TMP_DIR = os.tmpdir();
const RDWR_EXCL = O_CREAT | O_TRUNC | O_RDWR | O_EXCL;

const promisify = callback => {
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

const parseAffixes = (rawAffixes, defaultPrefix) => {
  if (typeof rawAffixes === 'string') return { prefix: rawAffixes, suffix: null };
  if (typeof rawAffixes === 'object') return rawAffixes;
  return { prefix: defaultPrefix, suffix: null };
};

const generateName = (rawAffixes, defaultPrefix) => {
  const affixes = parseAffixes(rawAffixes, defaultPrefix);
  const now = new Date();
  const uniqueSegment = `${now.getFullYear()}${now.getMonth()}${now.getDate()}-${process.pid}-${(Math.random() * 0x100000000 + 1).toString(36)}`;
  return path.join(affixes.dir || TMP_DIR, `${affixes.prefix}${uniqueSegment}${affixes.suffix || ''}`);
};

let tracking = false;
let exitListenerAttached = false;
const filesToDelete = [];
const dirsToDelete = [];

const track = (value = true) => {
  tracking = value;
  return module.exports;
};

const attachExitListener = () => {
  if (!tracking || exitListenerAttached) return;
  process.addListener('exit', () => {
    try {
      cleanupSync();
    } catch (err) {
      console.warn('Failed to clean temporary files on exit:', err);
      throw err;
    }
  });
  exitListenerAttached = true;
};

const deleteFileOnExit = filePath => {
  if (tracking && attachExitListener()) filesToDelete.push(filePath);
};

const deleteDirOnExit = dirPath => {
  if (tracking && attachExitListener()) dirsToDelete.push(dirPath);
};

const cleanupSync = () => {
  if (!tracking) return false;

  const cleanupListSync = list => {
    let count = 0;
    while (list.length) {
      rimrafSync(list.shift(), { maxBusyTries: 6 });
      count++;
    }
    return count;
  };

  return {
    files: cleanupListSync(filesToDelete),
    dirs: cleanupListSync(dirsToDelete)
  };
};

const cleanup = callback => {
  const [promise, handle] = promisify(callback);
  if (!tracking) return handle(new Error('Not tracking')), promise;

  let fileCount = 0, dirCount = 0, errors = null;

  const processCleanup = (err, count, type) => {
    if (err) errors = err;
    type === 'files' ? fileCount = count : dirCount = count;
    if (typeof fileCount === 'number' && typeof dirCount === 'number')
      handle(errors, { files: fileCount, dirs: dirCount });
  };

  cleanupFiles((err, count) => processCleanup(err, count, 'files'));
  cleanupDirs((err, count) => processCleanup(err, count, 'dirs'));

  return promise;
};

const cleanupFiles = callback => {
  const [promise, handle] = promisify(callback);
  if (!tracking) return handle(new Error('Not tracking')), promise;

  let count = 0;
  const listLength = filesToDelete.length;

  if (!listLength) return handle(null, count), promise;

  const fileCallback = err => {
    if (err) return handle(err), null;

    count++;
    if (--left === 0) handle(null, count);
  };

  filesToDelete.forEach(file => rimraf(file, { maxBusyTries: 6 }, fileCallback));

  return promise;
};

const cleanupDirs = callback => {
  const [promise, handle] = promisify(callback);
  if (!tracking) return handle(new Error('Not tracking')), promise;

  let count = 0;
  const listLength = dirsToDelete.length;

  if (!listLength) return handle(null, count), promise;

  const dirCallback = err => {
    if (err) return handle(err, count), null;

    count++;
    if (--listLength === 0) handle(null, count);
  };

  dirsToDelete.forEach(dir => rimraf(dir, { maxBusyTries: 6 }, dirCallback));

  return promise;
};

const mkdir = (affixes, callback) => {
  const [promise, handle] = promisify(callback);
  const dirPath = generateName(affixes, 'd-');

  mkdirp(dirPath, 0o700, err => {
    if (!err) deleteDirOnExit(dirPath);
    handle(err, dirPath);
  });

  return promise;
};

const mkdirSync = affixes => {
  const dirPath = generateName(affixes, 'd-');
  mkdirp.sync(dirPath, 0o700);
  deleteDirOnExit(dirPath);
  return dirPath;
};

const open = (affixes, callback) => {
  const [promise, handle] = promisify(callback);
  const filePath = generateName(affixes, 'f-');

  fs.open(filePath, RDWR_EXCL, 0o600, (err, fd) => {
    if (!err) deleteFileOnExit(filePath);
    handle(err, { path: filePath, fd });
  });

  return promise;
};

const openSync = affixes => {
  const filePath = generateName(affixes, 'f-');
  const fd = fs.openSync(filePath, RDWR_EXCL, 0o600);
  deleteFileOnExit(filePath);
  return { path: filePath, fd };
};

const createWriteStream = affixes => {
  const filePath = generateName(affixes, 's-');
  const stream = fs.createWriteStream(filePath, { flags: RDWR_EXCL, mode: 0o600 });
  deleteFileOnExit(filePath);
  return stream;
};

module.exports = {
  dir: TMP_DIR,
  track,
  mkdir,
  mkdirSync,
  open,
  openSync,
  createWriteStream,
  path: generateName,
  cleanup,
  cleanupSync
};
