const fs = require('fs');
const path = require('path');
const cnst = require('constants');
const os = require('os');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');

const rimrafSync = rimraf.sync;
const osTmpdir = os.tmpdir();
const RDWR_EXCL = cnst.O_CREAT | cnst.O_TRUNC | cnst.O_RDWR | cnst.O_EXCL;

let dir = path.resolve(osTmpdir);

let tracking = false;
let exitListenerAttached = false;
let filesToDelete = [];
let dirsToDelete = [];

function promisify(callback) {
  if (typeof callback === 'function') {
    return [undefined, callback];
  }

  let promiseCallback;
  const promise = new Promise((resolve, reject) => {
    promiseCallback = (...args) => {
      const err = args.shift();
      process.nextTick(() => (err ? reject(err) : resolve(args.length === 1 ? args[0] : args)));
    };
  });

  return [promise, promiseCallback];
}

function parseAffixes(rawAffixes, defaultPrefix) {
  const affixes = { prefix: null, suffix: null };
  if (rawAffixes) {
    if (typeof rawAffixes === 'string') {
      affixes.prefix = rawAffixes;
    } else if (typeof rawAffixes === 'object') {
      Object.assign(affixes, rawAffixes);
    } else {
      throw new Error("Unknown affix declaration: " + affixes);
    }
  } else {
    affixes.prefix = defaultPrefix;
  }
  return affixes;
}

function generateName(rawAffixes, defaultPrefix) {
  const affixes = parseAffixes(rawAffixes, defaultPrefix);
  const now = new Date();
  const name = `${affixes.prefix}${now.getFullYear()}${now.getMonth()}${now.getDate()}-${process.pid}-${(
    Math.random() * 0x100000000 + 1
  ).toString(36)}${affixes.suffix}`;
  return path.join(affixes.dir || dir, name);
}

function deleteFileOnExit(filePath) {
  if (!tracking) return;
  attachExitListener();
  filesToDelete.push(filePath);
}

function deleteDirOnExit(dirPath) {
  if (!tracking) return;
  attachExitListener();
  dirsToDelete.push(dirPath);
}

function attachExitListener() {
  if (!tracking || exitListenerAttached) return;
  process.addListener('exit', () => {
    try {
      cleanupSync();
    } catch (err) {
      console.warn("Failed to clean temporary files on exit: ", err);
      throw err;
    }
  });
  exitListenerAttached = true;
}

function cleanupFilesSync() {
  if (!tracking) return false;
  let count = 0;
  let toDelete;
  while ((toDelete = filesToDelete.shift()) !== undefined) {
    rimrafSync(toDelete, { maxBusyTries: 6 });
    count++;
  }
  return count;
}

function cleanupFiles(callback) {
  const [promise, cb] = promisify(callback);
  if (!tracking) {
    cb(new Error("not tracking"));
    return promise;
  }

  let count = 0;
  let left = filesToDelete.length;
  if (!left) {
    cb(null, count);
    return promise;
  }

  while (filesToDelete.length) {
    const toDelete = filesToDelete.shift();
    rimraf(toDelete, { maxBusyTries: 6 }, (err) => {
      if (--left < 0) return;
      if (err) {
        cb(err);
        left = 0;
      } else if (!left) {
        cb(null, ++count);
      } else {
        count++;
      }
    });
  }
  return promise;
}

function cleanupDirsSync() {
  if (!tracking) return false;
  let count = 0;
  let toDelete;
  while ((toDelete = dirsToDelete.shift()) !== undefined) {
    rimrafSync(toDelete, { maxBusyTries: 6 });
    count++;
  }
  return count;
}

function cleanupDirs(callback) {
  const [promise, cb] = promisify(callback);
  if (!tracking) {
    cb(new Error("not tracking"));
    return promise;
  }

  let count = 0;
  let left = dirsToDelete.length;
  if (!left) {
    cb(null, count);
    return promise;
  }

  while (dirsToDelete.length) {
    const toDelete = dirsToDelete.shift();
    rimraf(toDelete, { maxBusyTries: 6 }, (err, count) => {
      if (--left < 0) return;
      if (err) {
        cb(err);
        left = 0;
      } else if (!left) {
        cb(null, ++count);
      } else {
        count++;
      }
    });
  }
  return promise;
}

function cleanupSync() {
  if (!tracking) return false;
  return {
    files: cleanupFilesSync(),
    dirs: cleanupDirsSync(),
  };
}

function cleanup(callback) {
  const [promise, cb] = promisify(callback);
  if (!tracking) {
    cb(new Error("not tracking"));
    return promise;
  }

  cleanupFiles((fileErr, fileCount) => {
    if (fileErr) return cb(fileErr, { files: fileCount });
    cleanupDirs((dirErr, dirCount) => cb(dirErr, { files: fileCount, dirs: dirCount }));
  });
  return promise;
}

function mkdir(affixes, callback) {
  const [promise, cb] = promisify(callback);
  const dirPath = generateName(affixes, 'd-');
  mkdirp(dirPath, 0o700, (err) => {
    if (!err) deleteDirOnExit(dirPath);
    cb(err, dirPath);
  });
  return promise;
}

function mkdirSync(affixes) {
  const dirPath = generateName(affixes, 'd-');
  mkdirp.sync(dirPath, 0o700);
  deleteDirOnExit(dirPath);
  return dirPath;
}

function open(affixes, callback) {
  const [promise, cb] = promisify(callback);
  const filePath = generateName(affixes, 'f-');
  fs.open(filePath, RDWR_EXCL, 0o600, (err, fd) => {
    if (!err) deleteFileOnExit(filePath);
    cb(err, { path: filePath, fd });
  });
  return promise;
}

function openSync(affixes) {
  const filePath = generateName(affixes, 'f-');
  const fd = fs.openSync(filePath, RDWR_EXCL, 0o600);
  deleteFileOnExit(filePath);
  return { path: filePath, fd };
}

function createWriteStream(affixes) {
  const filePath = generateName(affixes, 's-');
  const stream = fs.createWriteStream(filePath, { flags: RDWR_EXCL, mode: 0o600 });
  deleteFileOnExit(filePath);
  return stream;
}

function track(value) {
  tracking = value !== false;
  return module.exports;
}

module.exports = {
  dir,
  track,
  mkdir,
  mkdirSync,
  open,
  openSync,
  path: generateName,
  cleanup,
  cleanupSync,
  createWriteStream,
};
