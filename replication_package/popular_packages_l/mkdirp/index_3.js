// mkdirp.js

import fs from 'fs';
import path from 'path';

const DEFAULT_MODE = 0o777;

/**
 * Asynchronous function to create a directory and its parent directories if needed.
 * @param {string} dir - The directory path to create.
 * @param {object|number} opts - Options object or mode number.
 * @returns {Promise<string|undefined>} - A promise that resolves to the created directory path or undefined.
 */
async function mkdirp(dir, opts = {}) {
  const mode = typeof opts === 'number' ? opts : (opts.mode || DEFAULT_MODE);
  const fsImpl = opts.fs || fs;

  try {
    // Attempt to create the directory natively with recursion
    const made = await mkdirpNative(dir, { mode, fs: fsImpl });
    return made;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If the parent directory doesn't exist, recursively attempt to create the parent
      const parentDir = path.dirname(dir);
      const made = await mkdirp(parentDir, { mode, fs: fsImpl });
      await mkdirpNative(dir, { mode, fs: fsImpl });
      return made || dir;
    }
    throw err;
  }
}

/**
 * Asynchronous helper function to create a directory natively with recursive options.
 * @param {string} dir - The directory path to create.
 * @param {object} opts - Options containing mode and fs (filesystem implementation).
 * @returns {Promise<string|undefined>} - A promise that resolves to the created directory path or undefined.
 */
async function mkdirpNative(dir, opts) {
  return new Promise((resolve, reject) => {
    opts.fs.mkdir(dir, { recursive: true, mode: opts.mode }, (err) => {
      if (err) {
        if (err.code === 'EEXIST') return resolve();
        return reject(err);
      }
      resolve(dir);
    });
  });
}

/**
 * Synchronous function to create a directory and its parent directories if needed.
 * @param {string} dir - The directory path to create.
 * @param {object|number} opts - Options object or mode number.
 * @returns {string|undefined} - The created directory path or undefined.
 */
function mkdirpSync(dir, opts = {}) {
  const mode = typeof opts === 'number' ? opts : (opts.mode || DEFAULT_MODE);
  const fsImpl = opts.fs || fs;

  return mkdirpNativeSync(dir, { mode, fs: fsImpl });
}

/**
 * Synchronous helper function to create a directory natively with recursive options.
 * @param {string} dir - The directory path to create.
 * @param {object} opts - Options containing mode and fs (filesystem implementation).
 * @returns {string|undefined} - The created directory path or undefined.
 */
function mkdirpNativeSync(dir, opts) {
  try {
    // Attempt to create the directory with recursion
    opts.fs.mkdirSync(dir, { recursive: true, mode: opts.mode });
    return dir;
  } catch (err) {
    if (err.code === 'EEXIST') return;
    // If the parent directory doesn't exist, recursively attempt to create the parent
    const parentDir = path.dirname(dir);
    mkdirpSync(parentDir, { mode: opts.mode, fs: opts.fs });
    opts.fs.mkdirSync(dir, { mode: opts.mode });
    return dir;
  }
}

export { mkdirp, mkdirpSync };
