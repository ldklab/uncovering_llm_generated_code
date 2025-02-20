'use strict';

const { platform } = require('os');
const { spawnSync } = require('child_process');
const { readdirSync } = require('fs');

const GLIBC = 'glibc';
const MUSL = 'musl';

const spawnOptions = { encoding: 'utf8', env: process.env };

function contains(needle) {
  return haystack => haystack.includes(needle);
}

function versionFromMuslLdd(output) {
  return output.split(/[\r\n]+/)[1].trim().split(/\s+/)[1];
}

function safeReaddirSync(path) {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
}

let family = '';
let version = '';
let method = '';

if (platform() === 'linux') {
  const glibc = spawnSync('getconf', ['GNU_LIBC_VERSION'], spawnOptions);
  if (glibc.status === 0) {
    family = GLIBC;
    version = glibc.stdout.trim().split(' ')[1];
    method = 'getconf';
  } else {
    const ldd = spawnSync('ldd', ['--version'], spawnOptions);
    if ((ldd.status === 0 || ldd.status === 1) && ldd.stdout.includes(MUSL)) {
      family = MUSL;
      version = versionFromMuslLdd(ldd.stdout);
      method = 'ldd';
    } else if (ldd.stderr.includes(MUSL)) {
      family = MUSL;
      version = versionFromMuslLdd(ldd.stderr);
      method = 'ldd';
    } else {
      const libFiles = safeReaddirSync('/lib');
      const usrSbinFiles = safeReaddirSync('/usr/sbin');

      if (libFiles.some(contains('-linux-gnu'))) {
        family = GLIBC;
        method = 'filesystem';
      } else if (libFiles.some(contains('libc.musl-')) || libFiles.some(contains('ld-musl-'))) {
        family = MUSL;
        method = 'filesystem';
      } else if (usrSbinFiles.some(contains('glibc'))) {
        family = GLIBC;
        method = 'filesystem';
      }
    }
  }
}

const isNonGlibcLinux = (family && family !== GLIBC);

module.exports = {
  GLIBC,
  MUSL,
  family,
  version,
  method,
  isNonGlibcLinux
};
