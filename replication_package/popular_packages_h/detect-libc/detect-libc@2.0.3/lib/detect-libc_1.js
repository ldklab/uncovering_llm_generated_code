'use strict';

const childProcess = require('child_process');
const { isLinux, getReport } = require('./process');
const { LDD_PATH, readFile, readFileSync } = require('./filesystem');

const GLIBC = 'glibc';
const MUSL = 'musl';
const RE_GLIBC_VERSION = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i;
const command = 'getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true';

let cachedFamilyFilesystem;
let cachedVersionFilesystem;
let commandOut = '';

const safeCommand = async () => {
  if (!commandOut) {
    commandOut = await new Promise((resolve) => {
      childProcess.exec(command, (err, out) => resolve(err ? ' ' : out));
    });
  }
  return commandOut;
};

const safeCommandSync = () => {
  if (!commandOut) {
    try {
      commandOut = childProcess.execSync(command, { encoding: 'utf8' });
    } catch {
      commandOut = ' ';
    }
  }
  return commandOut;
};

const isFileMusl = (f) => f.includes('libc.musl-') || f.includes('ld-musl-');

const familyFromReport = () => {
  const report = getReport();
  return report.header?.glibcVersionRuntime ? GLIBC : (report.sharedObjects?.some(isFileMusl) ? MUSL : null);
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
  try {
    const lddContent = await readFile(LDD_PATH);
    cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
  } catch {}
  return cachedFamilyFilesystem;
};

const familyFromFilesystemSync = () => {
  if (cachedFamilyFilesystem !== undefined) return cachedFamilyFilesystem;
  try {
    const lddContent = readFileSync(LDD_PATH);
    cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
  } catch {}
  return cachedFamilyFilesystem;
};

const family = async () => {
  if (!isLinux()) return null;

  let family = await familyFromFilesystem();
  if (!family) family = familyFromReport();
  if (!family) family = familyFromCommand(await safeCommand());

  return family;
};

const familySync = () => {
  if (!isLinux()) return null;

  let family = familyFromFilesystemSync();
  if (!family) family = familyFromReport();
  if (!family) family = familyFromCommand(safeCommandSync());

  return family;
};

const isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
const isNonGlibcLinuxSync = () => isLinux() && familySync() !== GLIBC;

const versionFromFilesystem = async () => {
  if (cachedVersionFilesystem !== undefined) return cachedVersionFilesystem;
  
  try {
    const lddContent = await readFile(LDD_PATH);
    const match = lddContent.match(RE_GLIBC_VERSION);
    if (match) cachedVersionFilesystem = match[1];
  } catch {}

  return cachedVersionFilesystem;
};

const versionFromFilesystemSync = () => {
  if (cachedVersionFilesystem !== undefined) return cachedVersionFilesystem;

  try {
    const lddContent = readFileSync(LDD_PATH);
    const match = lddContent.match(RE_GLIBC_VERSION);
    if (match) cachedVersionFilesystem = match[1];
  } catch {}

  return cachedVersionFilesystem;
};

const versionFromReport = () => getReport().header?.glibcVersionRuntime || null;

const versionSuffix = (s) => s.trim().split(/\s+/)[1];

const versionFromCommand = (out) => {
  const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
  if (getconf?.includes(GLIBC)) return versionSuffix(getconf);
  if (ldd1?.includes(MUSL) && ldd2) return versionSuffix(ldd2);
  return null;
};

const version = async () => {
  if (!isLinux()) return null;

  let version = await versionFromFilesystem();
  if (!version) version = versionFromReport();
  if (!version) version = versionFromCommand(await safeCommand());

  return version;
};

const versionSync = () => {
  if (!isLinux()) return null;

  let version = versionFromFilesystemSync();
  if (!version) version = versionFromReport();
  if (!version) version = versionFromCommand(safeCommandSync());

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
