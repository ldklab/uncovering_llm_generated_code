'use strict';

const childProcess = require('child_process');
const { isLinux, getReport } = require('./process');
const { LDD_PATH, readFile, readFileSync } = require('./filesystem');

let cachedFamilyFilesystem;
let cachedVersionFilesystem;

const command = 'getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true';
let commandOut = '';

const executeCommandAsync = () => {
  if (!commandOut) {
    return new Promise((resolve) => {
      childProcess.exec(command, (err, out) => {
        commandOut = err ? ' ' : out;
        resolve(commandOut);
      });
    });
  }
  return commandOut;
};

const executeCommandSync = () => {
  if (!commandOut) {
    try {
      commandOut = childProcess.execSync(command, { encoding: 'utf8' });
    } catch (_err) {
      commandOut = ' ';
    }
  }
  return commandOut;
};

const GLIBC = 'glibc';
const RE_GLIBC_VERSION = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i;
const MUSL = 'musl';

const isMuslFile = (file) => file.includes('libc.musl-') || file.includes('ld-musl-');

const familyFromReport = () => {
  const report = getReport();
  if (report.header?.glibcVersionRuntime) return GLIBC;
  if (report.sharedObjects?.some(isMuslFile)) return MUSL;
  return null;
};

const familyFromCommand = (out) => {
  const [getconf, ldd1] = out.split(/[\r\n]+/);
  if (getconf?.includes(GLIBC)) return GLIBC;
  if (ldd1?.includes(MUSL)) return MUSL;
  return null;
};

const getFamilyFromLddContent = (content) => {
  if (content.includes('musl')) return MUSL;
  if (content.includes('GNU C Library')) return GLIBC;
  return null;
};

const familyFromFilesystem = async () => {
  if (cachedFamilyFilesystem !== undefined) return cachedFamilyFilesystem;
  
  cachedFamilyFilesystem = null;
  try {
    const lddContent = await readFile(LDD_PATH);
    cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
  } catch (e) {}
  return cachedFamilyFilesystem;
};

const familyFromFilesystemSync = () => {
  if (cachedFamilyFilesystem !== undefined) return cachedFamilyFilesystem;

  cachedFamilyFilesystem = null;
  try {
    const lddContent = readFileSync(LDD_PATH);
    cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
  } catch (e) {}
  return cachedFamilyFilesystem;
};

const family = async () => {
  let family = null;
  if (isLinux()) {
    family = await familyFromFilesystem();
    if (!family) family = familyFromReport();
    if (!family) {
      const out = await executeCommandAsync();
      family = familyFromCommand(out);
    }
  }
  return family;
};

const familySync = () => {
  let family = null;
  if (isLinux()) {
    family = familyFromFilesystemSync();
    if (!family) family = familyFromReport();
    if (!family) {
      const out = executeCommandSync();
      family = familyFromCommand(out);
    }
  }
  return family;
};

const isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
const isNonGlibcLinuxSync = () => isLinux() && familySync() !== GLIBC;

const versionFromFilesystem = async () => {
  if (cachedVersionFilesystem !== undefined) return cachedVersionFilesystem;

  cachedVersionFilesystem = null;
  try {
    const lddContent = await readFile(LDD_PATH);
    const versionMatch = lddContent.match(RE_GLIBC_VERSION);
    if (versionMatch) cachedVersionFilesystem = versionMatch[1];
  } catch (e) {}
  return cachedVersionFilesystem;
};

const versionFromFilesystemSync = () => {
  if (cachedVersionFilesystem !== undefined) return cachedVersionFilesystem;

  cachedVersionFilesystem = null;
  try {
    const lddContent = readFileSync(LDD_PATH);
    const versionMatch = lddContent.match(RE_GLIBC_VERSION);
    if (versionMatch) cachedVersionFilesystem = versionMatch[1];
  } catch (e) {}
  return cachedVersionFilesystem;
};

const versionFromReport = () => {
  const report = getReport();
  return report.header?.glibcVersionRuntime || null;
};

const extractVersionSuffix = (s) => s.trim().split(/\s+/)[1];

const versionFromCommand = (out) => {
  const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
  if (getconf?.includes(GLIBC)) return extractVersionSuffix(getconf);
  if (ldd1 && ldd2 && ldd1.includes(MUSL)) return extractVersionSuffix(ldd2);
  return null;
};

const version = async () => {
  let version = null;
  if (isLinux()) {
    version = await versionFromFilesystem();
    if (!version) version = versionFromReport();
    if (!version) {
      const out = await executeCommandAsync();
      version = versionFromCommand(out);
    }
  }
  return version;
};

const versionSync = () => {
  let version = null;
  if (isLinux()) {
    version = versionFromFilesystemSync();
    if (!version) version = versionFromReport();
    if (!version) {
      const out = executeCommandSync();
      version = versionFromCommand(out);
    }
  }
  return version;
};

module.exports = {
  GLIBC,
  MUSL,
  family,
  familySync,
  isNonGlibcLinux,
  isNonGlibcLinuxSync,
  version,
  versionSync
};
