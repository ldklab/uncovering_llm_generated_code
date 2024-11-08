// mkdirp.js

import fs from 'fs';
import path from 'path';

const DEFAULT_MODE = 0o777;

// Asynchronous mkdirp
async function mkdirp(dir, opts = {}) {
  const mode = typeof opts === 'number' ? opts : (opts.mode || DEFAULT_MODE);
  const fsImpl = opts.fs || fs;

  try {
    const made = await mkdirpNative(dir, { mode, fs: fsImpl });
    return made;
  } catch (err) {
    if (err.code === 'ENOENT') {
      const parentDir = path.dirname(dir);
      const made = await mkdirp(parentDir, { mode, fs: fsImpl });
      await mkdirpNative(dir, { mode, fs: fsImpl });
      return made || dir;
    }
    throw err;
  }
}

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

// Synchronous mkdirp
function mkdirpSync(dir, opts = {}) {
  const mode = typeof opts === 'number' ? opts : (opts.mode || DEFAULT_MODE);
  const fsImpl = opts.fs || fs;

  return mkdirpNativeSync(dir, { mode, fs: fsImpl });
}

function mkdirpNativeSync(dir, opts) {
  try {
    opts.fs.mkdirSync(dir, { recursive: true, mode: opts.mode });
    return dir;
  } catch (err) {
    if (err.code === 'EEXIST') return;
    const parentDir = path.dirname(dir);
    mkdirpSync(parentDir, { mode: opts.mode, fs: opts.fs });
    opts.fs.mkdirSync(dir, { mode: opts.mode });
    return dir;
  }
}

export { mkdirp, mkdirpSync };
