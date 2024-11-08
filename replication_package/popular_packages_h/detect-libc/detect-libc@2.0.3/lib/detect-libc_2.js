'use strict';

const childProcess = require('child_process');
const { isLinux, getReport } = require('./process');
const { LDD_PATH, readFile, readFileSync } = require('./filesystem');

const GLIBC = 'glibc';
const MUSL = 'musl';
const RE_GLIBC_VERSION = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i;

let cachedFamilyFilesystem;
let cachedVersionFilesystem;
let commandOut = '';

const command = 'getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true';

const safeCommand = () => {
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

const safeCommandSync = () => {
  if (!commandOut) {
    try {
      commandOut = childProcess.execSync(command, { encoding: 'utf8' });
    } catch (_err) {
      commandOut = ' ';
    }
  }
  return commandOut;
};

const isFileMusl = (f) => f.includes('libc.musl-') || f.includes('ld-musl-');

const familyFromReport = () => {
  const report = getReport();
  if (report.header && report.header.glibcVersionRuntime) return GLIBC;
  if (Array.isArray(report.sharedObjects)) {
    if (report.sharedObjects.some(isFileMusl)) return MUSL;
  }
  return null;
};

const familyFromCommand = (out) => {
  const [getconf, ldd1] = out.split(/[\r\n]+/);
  if (getconf && getconf.includes(GLIBC)) return GLIBC;
  if (ldd1 && ldd1.includes(MUSL)) return MUSL;
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
    if (!family) family = familyFromCommand(await safeCommand());
  }
  return family;
};

const familySync = () => {
  let family = null;
  if (isLinux()) {
    family = familyFromFilesystemSync();
    if (!family) family = familyFromReport();
    if (!family) family = familyFromCommand(safeCommandSync());
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
  if (report.header && report.header.glibcVersionRuntime) {
    return report.header.glibcVersionRuntime;
  }
  return null;
};

const versionSuffix = (s) => s.trim().split(/\s+/)[1];

const versionFromCommand = (out) => {
  const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
  if (getconf && getconf.includes(GLIBC)) {
    return versionSuffix(getconf);
  }
  if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
    return versionSuffix(ldd2);
  }
  return null;
};

const version = async () => {
  let version = null;
  if (isLinux()) {
    version = await versionFromFilesystem();
    if (!version) version = versionFromReport();
    if (!version) version = versionFromCommand(await safeCommand());
  }
  return version;
};

const versionSync = () => {
  let version = null;
  if (isLinux()) {
    version = versionFromFilesystemSync();
    if (!version) version = versionFromReport();
    if (!version) version = versionFromCommand(safeCommandSync());
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
