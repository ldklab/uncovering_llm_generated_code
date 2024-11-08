// mkdirp.js

import fs from 'fs';
import path from 'path';

const DEFAULT_MODE = 0o777;

// Asynchronous mkdirp
async function mkdirp(dir, opts = {}) {
  const mode = typeof opts === 'number' ? opts : (opts.mode || DEFAULT_MODE);
  const fsImpl = opts.fs || fs;

  try {
    // Attempt to create the directory using the native asynchronous method
    const made = await mkdirpNative(dir, { mode, fs: fsImpl });
    return made;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If parent directory does not exist, recursively attempt to create it
      const parentDir = path.dirname(dir);
      const made = await mkdirp(parentDir, { mode, fs: fsImpl });
      // Retry creating the desired directory
      await mkdirpNative(dir, { mode, fs: fsImpl });
      return made || dir;
    }
    throw err;  // Re-throw other errors
  }
}

// Native asynchronous directory creation
async function mkdirpNative(dir, opts) {
  return new Promise((resolve, reject) => {
    opts.fs.mkdir(dir, { recursive: true, mode: opts.mode }, (err) => {
      if (err) {
        if (err.code === 'EEXIST') return resolve();  // Resolve if already exists
        return reject(err); // Reject on other errors
      }
      resolve(dir);  // Successfully created, resolve with directory path
    });
  });
}

// Synchronous mkdirp
function mkdirpSync(dir, opts = {}) {
  const mode = typeof opts === 'number' ? opts : (opts.mode || DEFAULT_MODE);
  const fsImpl = opts.fs || fs;

  return mkdirpNativeSync(dir, { mode, fs: fsImpl });
}

// Native synchronous directory creation
function mkdirpNativeSync(dir, opts) {
  try {
    opts.fs.mkdirSync(dir, { recursive: true, mode: opts.mode });
    return dir;  // Return directory path on success
  } catch (err) {
    if (err.code === 'EEXIST') return;  // Return if already exists
    const parentDir = path.dirname(dir);  // Handle ENOENT by creating parent
    mkdirpSync(parentDir, { mode: opts.mode, fs: opts.fs });
    opts.fs.mkdirSync(dir, { mode: opts.mode });
    return dir;
  }
}

export { mkdirp, mkdirpSync };
