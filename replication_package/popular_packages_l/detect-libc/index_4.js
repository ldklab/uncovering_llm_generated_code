// detect-libc.js

const { execSync } = require('child_process');
const fs = require('fs');

const GLIBC = 'glibc';
const MUSL = 'musl';

const checkLibcContent = (content) => {
  if (content.includes('GNU')) return GLIBC;
  if (/musl/.test(content)) return MUSL;
  return null;
};

const getLibcFromLdd = () => {
  try {
    const lddPath = execSync('which ldd').toString().trim();
    const lddContent = fs.readFileSync(lddPath, 'utf8');
    return checkLibcContent(lddContent);
  } catch {
    return null;
  }
};

const getLibcVersion = (family) => {
  try {
    const command = family === GLIBC ? 'ldd' : 'ldd --version';
    const result = execSync(command).toString();
    const versionMatch = result.match(/(\d+\.\d+(\.\d+)?)/);
    return versionMatch ? versionMatch[0] : null;
  } catch {
    return null;
  }
};

const family = async () => getLibcFromLdd();

const familySync = () => getLibcFromLdd();

const version = async () => {
  const libcFamily = await family();
  return libcFamily ? getLibcVersion(libcFamily) : null;
};

const versionSync = () => {
  const libcFamily = familySync();
  return libcFamily ? getLibcVersion(libcFamily) : null;
};

const isNonGlibcLinux = async () => (await family()) !== GLIBC;

const isNonGlibcLinuxSync = () => familySync() !== GLIBC;

module.exports = {
  GLIBC,
  MUSL,
  family,
  familySync,
  version,
  versionSync,
  isNonGlibcLinux,
  isNonGlibcLinuxSync,
};
