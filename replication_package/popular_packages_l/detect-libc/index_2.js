// libc-detector.js

const fs = require('fs');
const { execSync } = require('child_process');

const GLIBC = 'glibc';
const MUSL = 'musl';

function identifyLibc(content) {
  if (content.includes('GNU')) return GLIBC;
  if (content.includes('musl')) return MUSL;
  return null;
}

function detectLibcUsingLdd() {
  try {
    const lddPath = execSync('which ldd').toString().trim();
    const lddFileContent = fs.readFileSync(lddPath, 'utf8');
    return identifyLibc(lddFileContent);
  } catch {
    return null;
  }
}

function detectLibcVersion(libcType) {
  try {
    const commandOutput = execSync(`${libcType === GLIBC ? 'ldd' : 'ldd --version'}`).toString();
    const version = commandOutput.match(/(\d+\.\d+(\.\d+)?)/);
    return version ? version[0] : null;
  } catch {
    return null;
  }
}

async function getLibcFamily() {
  return detectLibcUsingLdd();
}

function getLibcFamilySync() {
  return detectLibcUsingLdd();
}

async function getVersion() {
  const libcType = await getLibcFamily();
  return libcType ? detectLibcVersion(libcType) : null;
}

function getVersionSync() {
  const libcType = getLibcFamilySync();
  return libcType ? detectLibcVersion(libcType) : null;
}

async function checkNonGlibcLinux() {
  const libcType = await getLibcFamily();
  return libcType !== GLIBC;
}

function checkNonGlibcLinuxSync() {
  const libcType = getLibcFamilySync();
  return libcType !== GLIBC;
}

module.exports = {
  GLIBC,
  MUSL,
  getLibcFamily,
  getLibcFamilySync,
  getVersion,
  getVersionSync,
  checkNonGlibcLinux,
  checkNonGlibcLinuxSync
};
