const fs = require('fs');
const path = require('path');
const os = require('os');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const constants = require('constants');

const rimrafSync = rimraf.sync;
const dir = path.resolve(os.tmpdir());
const RDWR_EXCL = constants.O_CREAT | constants.O_TRUNC | constants.O_RDWR | constants.O_EXCL;

let tracking = false;
let exitListenerAttached = false;
let filesToDelete = [];
let dirsToDelete = [];

const promisify = (callback) => {
  if (typeof callback === 'function') {
    return [undefined, callback];
  }

  let promiseCallback;
  const promise = new Promise((resolve, reject) => {
    promiseCallback = (...args) => {
      const err = args.shift();
      process.nextTick(() => {
        if (err) {
          reject(err);
        } else {
          resolve(args.length === 1 ? args[0] : args);
        }
      });
    };
  });

  return [promise, promiseCallback];
};

const generateName = (rawAffixes, defaultPrefix) => {
  const affixes = parseAffixes(rawAffixes, defaultPrefix);
  const now = new Date();
  const name = [
    affixes.prefix,
    now.getFullYear(), now.getMonth(), now.getDate(),
    '-', process.pid, '-',
    (Math.random() * 0x100000000 + 1).toString(36),
    affixes.suffix,
  ].join('');
  return path.join(affixes.dir || dir, name);
};

const parseAffixes = (rawAffixes, defaultPrefix) => {
  let affixes = { prefix: null, suffix: null };
  if (rawAffixes) {
    if (typeof rawAffixes === 'string') {
      affixes.prefix = rawAffixes;
    } else if (typeof rawAffixes === 'object') {
      affixes = rawAffixes;
    } else {
      throw new Error("Unknown affix declaration: " + rawAffixes);
    }
  } else {
    affixes.prefix = defaultPrefix;
  }
  return affixes;
};

const track = (value) => {
  tracking = (value !== false);
  return module.exports;
};

const attachExitListener = () => {
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
  if (!tracking) return 0;
  let count = 0;
  let toDelete;
  while ((toDelete = filesToDelete.shift()) !== undefined) {
    rimrafSync(toDelete, { maxBusyTries: 6 });
    count++;
  }
  return count;
};

const cleanupFiles = (callback) => {
  const [promise, promisifiedCallback] = promisify(callback);
  if (!tracking) {
    promisifiedCallback(new Error("not tracking"));
    return promise;
  }
  let count = 0;
  let left = filesToDelete.length;
  if (!left) {
    promisifiedCallback(null, count);
    return promise;
  }

  const rimrafCallback = (err) => {
    if (!left) return;
    if (err) {
      promisifiedCallback(err);
      left = 0;
    } else {
      count++;
      left--;
      if (!left) promisifiedCallback(null, count);
    }
  };

  while ((toDelete = filesToDelete.shift()) !== undefined) {
    rimraf(toDelete, { maxBusyTries: 6 }, rimrafCallback);
  }
  return promise;
};

const cleanupDirsSync = () => {
  if (!tracking) return 0;
  let count = 0;
  let toDelete;
  while ((toDelete = dirsToDelete.shift()) !== undefined) {
    rimrafSync(toDelete, { maxBusyTries: 6 });
    count++;
  }
  return count;
};

const cleanupDirs = (callback) => {
  const [promise, promisifiedCallback] = promisify(callback);
  if (!tracking) {
    promisifiedCallback(new Error("not tracking"));
    return promise;
  }
  let count = 0;
  let left = dirsToDelete.length;
  if (!left) {
    promisifiedCallback(null, count);
    return promise;
  }
  
  const rimrafCallback = (err) => {
    if (!left) return;
    if (err) {
      promisifiedCallback(err, count);
      left = 0;
    } else {
      count++;
      left--;
      if (!left) promisifiedCallback(null, count);
    }
  };

  while ((toDelete = dirsToDelete.shift()) !== undefined) {
    rimraf(toDelete, { maxBusyTries: 6 }, rimrafCallback);
  }
  return promise;
};

const cleanupSync = () => {
  if (!tracking) return { files: 0, dirs: 0 };
  const fileCount = cleanupFilesSync();
  const dirCount = cleanupDirsSync();
  return { files: fileCount, dirs: dirCount };
};

const cleanup = (callback) => {
  const [promise, promisifiedCallback] = promisify(callback);
  if (!tracking) {
    promisifiedCallback(new Error("not tracking"));
    return promise;
  }
  cleanupFiles((fileErr, fileCount) => {
    if (fileErr) {
      promisifiedCallback(fileErr, { files: fileCount });
    } else {
      cleanupDirs((dirErr, dirCount) => {
        promisifiedCallback(dirErr, { files: fileCount, dirs: dirCount });
      });
    }
  });
  return promise;
};

const mkdir = (affixes, callback) => {
  const [promise, promisifiedCallback] = promisify(callback);
  const dirPath = generateName(affixes, 'd-');
  mkdirp(dirPath, 0o700, (err) => {
    if (!err) deleteDirOnExit(dirPath);
    promisifiedCallback(err, dirPath);
  });
  return promise;
};

const mkdirSync = (affixes) => {
  const dirPath = generateName(affixes, 'd-');
  mkdirp.sync(dirPath, 0o700);
  deleteDirOnExit(dirPath);
  return dirPath;
};

const open = (affixes, callback) => {
  const [promise, promisifiedCallback] = promisify(callback);
  const path = generateName(affixes, 'f-');
  fs.open(path, RDWR_EXCL, 0o600, (err, fd) => {
    if (!err) deleteFileOnExit(path);
    promisifiedCallback(err, { path, fd });
  });
  return promise;
};

const openSync = (affixes) => {
  const path = generateName(affixes, 'f-');
  const fd = fs.openSync(path, RDWR_EXCL, 0o600);
  deleteFileOnExit(path);
  return { path, fd };
};

const createWriteStream = (affixes) => {
  const path = generateName(affixes, 's-');
  const stream = fs.createWriteStream(path, { flags: RDWR_EXCL, mode: 0o600 });
  deleteFileOnExit(path);
  return stream;
};

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
