'use strict';

const { platform } = require('os');
const { spawnSync: originalSpawnSync } = require('child_process');
const { readdirSync } = require('fs');

const GLIBC = 'glibc';
const MUSL = 'musl';

const spawnSync = originalSpawnSync || function () {
  return { status: 126, stdout: '', stderr: '' };
};

const spawnOptions = {
  encoding: 'utf8',
  env: process.env
};

const contains = (needle) => (haystack) => haystack.includes(needle);

const versionFromMuslLdd = (out) => out.split(/[\r\n]+/)[1].trim().split(/\s/)[1];

const safeReaddirSync = (path) => {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
};

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
    const lddOutput = ldd.status === 0 ? ldd.stdout : ldd.stderr;
    
    if ((ldd.status === 0 || ldd.status === 1) && lddOutput.includes(MUSL)) {
      family = MUSL;
      version = versionFromMuslLdd(lddOutput);
      method = 'ldd';
    } else {
      const lib = safeReaddirSync('/lib');
      const usrSbin = safeReaddirSync('/usr/sbin');
      
      if (lib.some(contains('-linux-gnu')) || usrSbin.some(contains('glibc'))) {
        family = GLIBC;
        method = 'filesystem';
      } else if (lib.some(path => contains('libc.musl-')(path) || contains('ld-musl-')(path))) {
        family = MUSL;
        method = 'filesystem';
      }
    }
  }
}

const isNonGlibcLinux = family && family !== GLIBC;

module.exports = {
  GLIBC,
  MUSL,
  family,
  version,
  method,
  isNonGlibcLinux
};
