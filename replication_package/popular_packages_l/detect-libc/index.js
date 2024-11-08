// detect-libc.js

const fs = require('fs');
const { execSync } = require('child_process');

const GLIBC = 'glibc';
const MUSL = 'musl';

function checkLibcContent(content) {
  if (content.includes('GNU')) {
    return GLIBC;
  }
  if (/musl/.test(content)) {
    return MUSL;
  }
  return null;
}

function getLibcFromLdd() {
  try {
    const lddPath = execSync('which ldd').toString().trim();
    const lddContent = fs.readFileSync(lddPath, 'utf8');
    return checkLibcContent(lddContent);
  } catch {
    return null;
  }
}

function getLibcVersion(family) {
  try {
    const result = execSync(
      `${family === GLIBC ? 'ldd' : 'ldd --version'}`
    ).toString();
    const versionMatch = result.match(/(\d+\.\d+(\.\d+)?)/);
    return versionMatch ? versionMatch[0] : null;
  } catch {
    return null;
  }
}

async function family() {
  return getLibcFromLdd();
}

function familySync() {
  return getLibcFromLdd();
}

async function version() {
  const libcFamily = await family();
  if (libcFamily) {
    return getLibcVersion(libcFamily);
  }
  return null;
}

function versionSync() {
  const libcFamily = familySync();
  if (libcFamily) {
    return getLibcVersion(libcFamily);
  }
  return null;
}

async function isNonGlibcLinux() {
  const libcFamily = await family();
  return libcFamily !== GLIBC;
}

function isNonGlibcLinuxSync() {
  const libcFamily = familySync();
  return libcFamily !== GLIBC;
}

module.exports = {
  GLIBC,
  MUSL,
  family,
  familySync,
  version,
  versionSync,
  isNonGlibcLinux,
  isNonGlibcLinuxSync
};
