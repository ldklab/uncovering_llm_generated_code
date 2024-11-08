// detectLibc.js

const fs = require('fs');
const { execSync } = require('child_process');

const GLIBC = 'glibc';
const MUSL = 'musl';

function detectLibcContent(content) {
  if (content.includes('GNU')) {
    return GLIBC;
  }
  if (/musl/.test(content)) {
    return MUSL;
  }
  return null;
}

function determineLibcFromLdd() {
  try {
    const lddExecutablePath = execSync('which ldd', { encoding: 'utf8' }).trim();
    const lddFileContent = fs.readFileSync(lddExecutablePath, { encoding: 'utf8' });
    return detectLibcContent(lddFileContent);
  } catch {
    return null;
  }
}

function extractLibcVersion(libcFamily) {
  try {
    const command = libcFamily === GLIBC ? 'ldd --version' : 'ldd';
    const commandOutput = execSync(command, { encoding: 'utf8' });
    const versionPattern = /(\d+\.\d+(\.\d+)?)/;
    const matchedVersion = commandOutput.match(versionPattern);
    return matchedVersion ? matchedVersion[0] : null;
  } catch {
    return null;
  }
}

async function detectLibcFamily() {
  return determineLibcFromLdd();
}

function detectLibcFamilySync() {
  return determineLibcFromLdd();
}

async function getLibcVersion() {
  const libcFamilyType = await detectLibcFamily();
  return libcFamilyType ? extractLibcVersion(libcFamilyType) : null;
}

function getLibcVersionSync() {
  const libcFamilyType = detectLibcFamilySync();
  return libcFamilyType ? extractLibcVersion(libcFamilyType) : null;
}

async function isNonGlibcLinuxEnvironment() {
  const libcFamilyType = await detectLibcFamily();
  return libcFamilyType !== GLIBC;
}

function isNonGlibcLinuxEnvironmentSync() {
  const libcFamilyType = detectLibcFamilySync();
  return libcFamilyType !== GLIBC;
}

module.exports = {
  GLIBC,
  MUSL,
  family: detectLibcFamily,
  familySync: detectLibcFamilySync,
  version: getLibcVersion,
  versionSync: getLibcVersionSync,
  isNonGlibcLinux: isNonGlibcLinuxEnvironment,
  isNonGlibcLinuxSync: isNonGlibcLinuxEnvironmentSync
};
