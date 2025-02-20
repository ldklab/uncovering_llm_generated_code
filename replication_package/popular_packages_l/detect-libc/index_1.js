// detectLibc.js

const fs = require('fs');
const { execSync } = require('child_process');

const LIBC_TYPES = {
  GLIBC: 'glibc',
  MUSL: 'musl'
};

// Identify the libc type from content inspection
function identifyLibcFromContent(content) {
  if (content.includes('GNU')) {
    return LIBC_TYPES.GLIBC;
  }
  if (content.match(/musl/)) {
    return LIBC_TYPES.MUSL;
  }
  return null;
}

// Extract libc type by reading ldd file
function determineLibcUsingLdd() {
  try {
    const lddExecutablePath = execSync('which ldd').toString().trim();
    const lddFileContent = fs.readFileSync(lddExecutablePath, 'utf8');
    return identifyLibcFromContent(lddFileContent);
  } catch {
    return null;
  }
}

// Retrieve version number of the detected libc
function fetchLibcVersion(libcType) {
  try {
    const command = `${libcType === LIBC_TYPES.GLIBC ? 'ldd' : 'ldd --version'}`;
    const result = execSync(command).toString();
    const versionMatch = result.match(/(\d+\.\d+(\.\d+)?)/);
    return versionMatch ? versionMatch[0] : null;
  } catch {
    return null;
  }
}

async function detectLibcFamily() {
  return determineLibcUsingLdd();
}

function detectLibcFamilySync() {
  return determineLibcUsingLdd();
}

async function detectLibcVersion() {
  const libcType = await detectLibcFamily();
  return libcType ? fetchLibcVersion(libcType) : null;
}

function detectLibcVersionSync() {
  const libcType = detectLibcFamilySync();
  return libcType ? fetchLibcVersion(libcType) : null;
}

async function checkNonGlibcLinux() {
  const libcType = await detectLibcFamily();
  return libcType !== LIBC_TYPES.GLIBC;
}

function checkNonGlibcLinuxSync() {
  const libcType = detectLibcFamilySync();
  return libcType !== LIBC_TYPES.GLIBC;
}

module.exports = {
  GLIBC: LIBC_TYPES.GLIBC,
  MUSL: LIBC_TYPES.MUSL,
  family: detectLibcFamily,
  familySync: detectLibcFamilySync,
  version: detectLibcVersion,
  versionSync: detectLibcVersionSync,
  isNonGlibcLinux: checkNonGlibcLinux,
  isNonGlibcLinuxSync: checkNonGlibcLinuxSync
};
