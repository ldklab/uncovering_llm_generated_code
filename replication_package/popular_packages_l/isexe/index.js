import { stat, constants } from 'fs';
import { promisify } from 'util';
const statAsync = promisify(stat);

function checkExecutableOnWin32(path, pathExt) {
  const ext = path.split('.').pop();
  return pathExt.includes(`.${ext}`);
}

function checkExecutableOnPosix(stats, uid, gid) {
  const { mode } = stats;
  const isOwner = (stats.uid === uid);
  const isGroup = (stats.gid === gid);
  return ((isOwner && (mode & constants.S_IXUSR)) ||
          (isGroup && (mode & constants.S_IXGRP)) ||
          (mode & constants.S_IXOTH));
}

async function isexe(path, options = {}) {
  try {
    const stats = await statAsync(path);
    return process.platform === 'win32'
      ? checkExecutableOnWin32(path, options.pathExt || process.env.PATHEXT.split(';'))
      : checkExecutableOnPosix(stats, options.uid || process.getuid(), options.gid || process.getgid());
  } catch (err) {
    if (options.ignoreErrors) return false;
    throw err;
  }
}

function sync(path, options = {}) {
  try {
    const stats = stat(path);
    return process.platform === 'win32'
      ? checkExecutableOnWin32(path, options.pathExt || process.env.PATHEXT.split(';'))
      : checkExecutableOnPosix(stats, options.uid || process.getuid(), options.gid || process.getgid());
  } catch (err) {
    if (options.ignoreErrors) return false;
    throw err;
  }
}

const win32 = {
  isexe: async (path, options) => await isexe(path, { ...options, pathExt: options.pathExt || process.env.PATHEXT.split(';') }),
  sync: (path, options) => sync(path, { ...options, pathExt: options.pathExt || process.env.PATHEXT.split(';') })
};

const posix = {
  isexe: async (path, options) => await isexe(path, options),
  sync: (path, options) => sync(path, options)
};

const selectedImplementation = process.platform === 'win32' ? win32 : posix;

export const { isexe, sync } = selectedImplementation;
export { win32, posix };
