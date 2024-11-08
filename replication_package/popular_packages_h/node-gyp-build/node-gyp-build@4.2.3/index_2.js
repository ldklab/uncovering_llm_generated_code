const fs = require('fs');
const path = require('path');
const os = require('os');

const runtimeRequire = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

const vars = (process.config && process.config.variables) || {};
const prebuildsOnly = Boolean(process.env.PREBUILDS_ONLY);
const abi = process.versions.modules;
const runtime = isElectron() ? 'electron' : 'node';
const arch = os.arch();
const platform = os.platform();
const libc = process.env.LIBC || (isAlpine(platform) ? 'musl' : 'glibc');
const armv = process.env.ARM_VERSION || (arch === 'arm64' ? '8' : vars.arm_version) || '';
const uv = (process.versions.uv || '').split('.')[0];

module.exports = load;

function load(dir) {
  return runtimeRequire(load.path(dir));
}

load.path = function(dir) {
  dir = path.resolve(dir || '.');

  try {
    const pkgName = runtimeRequire(path.join(dir, 'package.json')).name.toUpperCase().replace(/-/g, '_');
    if (process.env[pkgName + '_PREBUILD']) dir = process.env[pkgName + '_PREBUILD'];
  } catch (err) {}

  if (!prebuildsOnly) {
    const release = getFirst(path.join(dir, 'build/Release'), matchBuild);
    if (release) return release;

    const debug = getFirst(path.join(dir, 'build/Debug'), matchBuild);
    if (debug) return debug;
  }

  const prebuild = resolve(dir);
  if (prebuild) return prebuild;

  const nearby = resolve(path.dirname(process.execPath));
  if (nearby) return nearby;

  const target = [
    `platform=${platform}`,
    `arch=${arch}`,
    `runtime=${runtime}`,
    `abi=${abi}`,
    uv ? `uv=${uv}` : '',
    armv ? `armv=${armv}` : '',
    `libc=${libc}`,
    `node=${process.versions.node}`,
    process.versions.electron ? `electron=${process.versions.electron}` : '',
    typeof __webpack_require__ === 'function' ? 'webpack=true' : ''
  ].filter(Boolean).join(' ');

  throw new Error(`No native build was found for ${target}\n    loaded from: ${dir}\n`);
};

function resolve(dir) {
  const prebuildsPath = path.join(dir, 'prebuilds', `${platform}-${arch}`);
  const candidates = readdirSync(prebuildsPath).map(parseTags).filter(matchTags(runtime, abi));
  const winner = candidates.sort(compareTags(runtime))[0];
  return winner && path.join(prebuildsPath, winner.file);
}

function readdirSync(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (err) {
    return [];
  }
}

function getFirst(dir, filter) {
  const files = readdirSync(dir).filter(filter);
  return files[0] && path.join(dir, files[0]);
}

function matchBuild(name) {
  return /\.node$/.test(name);
}

function parseTags(file) {
  const arr = file.split('.');
  const extension = arr.pop();
  const tags = { file, specificity: 0 };

  if (extension !== 'node') return;

  for (const tag of arr) {
    if (tag === 'node' || tag === 'electron' || tag === 'node-webkit') {
      tags.runtime = tag;
    } else if (tag.startsWith('abi')) {
      tags.abi = tag.slice(3);
    } else if (tag.startsWith('uv')) {
      tags.uv = tag.slice(2);
    } else if (tag.startsWith('armv')) {
      tags.armv = tag.slice(4);
    } else if (tag === 'napi') {
      tags.napi = true;
    } else if (['glibc', 'musl'].includes(tag)) {
      tags.libc = tag;
    } else {
      continue;
    }

    tags.specificity++;
  }

  return tags;
}

function matchTags(runtime, abi) {
  return tags => {
    if (!tags) return false;
    if (tags.runtime !== runtime && !runtimeAgnostic(tags)) return false;
    if (tags.abi !== abi && !tags.napi) return false;
    if (tags.uv && tags.uv !== uv) return false;
    if (tags.armv && tags.armv !== armv) return false;
    if (tags.libc && tags.libc !== libc) return false;

    return true;
  };
}

function runtimeAgnostic(tags) {
  return tags.runtime === 'node' && tags.napi;
}

function compareTags(runtime) {
  return (a, b) => {
    if (a.runtime !== b.runtime) return a.runtime === runtime ? -1 : 1;
    if (a.abi !== b.abi) return a.abi ? -1 : 1;
    return b.specificity - a.specificity;
  };
}

function isElectron() {
  return process.versions && process.versions.electron || process.env.ELECTRON_RUN_AS_NODE || 
    (typeof window !== 'undefined' && window.process && window.process.type === 'renderer');
}

function isAlpine(platform) {
  return platform === 'linux' && fs.existsSync('/etc/alpine-release');
}

load.parseTags = parseTags;
load.matchTags = matchTags;
load.compareTags = compareTags;
