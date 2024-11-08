// mkdirp.js

import fs from 'fs';
import path from 'path';

const DEFAULT_PERMISSIONS = 0o777;

/**
 * Asynchronous directory creation, similar to `mkdir -p`.
 * @param {string} directory - The directory path to create.
 * @param {object|number} [options] - Options object or the mode as a number.
 * @returns {Promise<string|undefined>} - The created directory path or undefined if it already existed.
 */
async function createDirectoryAsync(directory, options = {}) {
  const mode = typeof options === 'number' ? options : (options.mode || DEFAULT_PERMISSIONS);
  const filesystem = options.fs || fs;

  try {
    return await createDirNativeAsync(directory, { mode, fs: filesystem });
  } catch (error) {
    if (error.code === 'ENOENT') {
      const parentDirectory = path.dirname(directory);
      await createDirectoryAsync(parentDirectory, { mode, fs: filesystem });
      return createDirNativeAsync(directory, { mode, fs: filesystem });
    }
    throw error;
  }
}

async function createDirNativeAsync(directory, opts) {
  return new Promise((resolve, reject) => {
    opts.fs.mkdir(directory, { recursive: true, mode: opts.mode }, (error) => {
      if (error) {
        if (error.code === 'EEXIST') return resolve();
        return reject(error);
      }
      resolve(directory);
    });
  });
}

/**
 * Synchronous directory creation, similar to `mkdir -p`.
 * @param {string} directory - The directory path to create.
 * @param {object|number} [options] - Options object or the mode as a number.
 * @returns {string|undefined} - The created directory path or undefined if it already existed.
 */
function createDirectorySync(directory, options = {}) {
  const mode = typeof options === 'number' ? options : (options.mode || DEFAULT_PERMISSIONS);
  const filesystem = options.fs || fs;

  return createDirNativeSync(directory, { mode, fs: filesystem });
}

function createDirNativeSync(directory, opts) {
  try {
    opts.fs.mkdirSync(directory, { recursive: true, mode: opts.mode });
    return directory;
  } catch (error) {
    if (error.code === 'EEXIST') return;
    const parentDirectory = path.dirname(directory);
    createDirectorySync(parentDirectory, { mode: opts.mode, fs: opts.fs });
    opts.fs.mkdirSync(directory, { mode: opts.mode });
    return directory;
  }
}

export { createDirectoryAsync as mkdirp, createDirectorySync as mkdirpSync };
