'use strict';

const os = require('os');
const { spawnSync: originalSpawnSync } = require('child_process');
const { readdirSync } = require('fs');

const GLIBC = 'glibc';
const MUSL = 'musl';

const spawnOptions = {
  encoding: 'utf8',
  env: process.env
};

const spawnSync = originalSpawnSync || (() => ({ status: 126, stdout: '', stderr: '' }));

const contains = (needle) => (haystack) => haystack.includes(needle);

function versionFromMuslLdd(out) {
  return out.split(/[\r\n]+/)[1].trim().split(/\s/)[1];
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

if (os.platform() === 'linux') {
  const glibc = spawnSync('getconf', ['GNU_LIBC_VERSION'], spawnOptions);
  if (glibc.status === 0) {
    family = GLIBC;
    version = glibc.stdout.trim().split(' ')[1];
    method = 'getconf';
  } else {
    const ldd = spawnSync('ldd', ['--version'], spawnOptions);
    if (ldd.status === 0 && ldd.stdout.includes(MUSL)) {
      family = MUSL;
      version = versionFromMuslLdd(ldd.stdout);
      method = 'ldd';
    } else if (ldd.status === 1 && ldd.stderr.includes(MUSL)) {
      family = MUSL;
      version = versionFromMuslLdd(ldd.stderr);
      method = 'ldd';
    } else {
      const lib = safeReaddirSync('/lib');
      if (lib.some(contains('-linux-gnu'))) {
        family = GLIBC;
        method = 'filesystem';
      } else if (lib.some(contains('libc.musl-')) || lib.some(contains('ld-musl-'))) {
        family = MUSL;
        method = 'filesystem';
      } else {
        const usrSbin = safeReaddirSync('/usr/sbin');
        if (usrSbin.some(contains('glibc'))) {
          family = GLIBC;
          method = 'filesystem';
        }
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
