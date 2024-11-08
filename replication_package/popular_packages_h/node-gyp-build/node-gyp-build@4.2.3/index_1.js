const fs = require('fs');
const path = require('path');
const os = require('os');

// Workaround to fix webpack's build warnings
const runtimeRequire = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

const vars = (process.config && process.config.variables) || {};
const prebuildsOnly = !!process.env.PREBUILDS_ONLY;
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

load.path = function (dir) {
  dir = path.resolve(dir || '.');

  try {
    const packageName = runtimeRequire(path.join(dir, 'package.json')).name.toUpperCase().replace(/-/g, '_');
    if (process.env[packageName + '_PREBUILD']) dir = process.env[packageName + '_PREBUILD'];
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
    'platform=' + platform,
    'arch=' + arch,
    'runtime=' + runtime,
    'abi=' + abi,
    'uv=' + uv,
    armv ? 'armv=' + armv : '',
    'libc=' + libc,
    'node=' + process.versions.node,
    (process.versions && process.versions.electron) ? 'electron=' + process.versions.electron : '',
    typeof __webpack_require__ === 'function' ? 'webpack=true' : ''
  ].filter(Boolean).join(' ');

  throw new Error('No native build was found for ' + target + '\n    loaded from: ' + dir + '\n');

  function resolve(dir) {
    const prebuilds = path.join(dir, 'prebuilds', platform + '-' + arch);
    const parsed = readdirSync(prebuilds).map(parseTags);
    const candidates = parsed.filter(matchTags(runtime, abi));
    const winner = candidates.sort(compareTags(runtime))[0];
    if (winner) return path.join(prebuilds, winner.file);
  }
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
  const tags = { file: file, specificity: 0 };

  if (extension !== 'node') return;

  for (let i = 0; i < arr.length; i++) {
    const tag = arr[i];

    if (tag === 'node' || tag === 'electron' || tag === 'node-webkit') {
      tags.runtime = tag;
    } else if (tag === 'napi') {
      tags.napi = true;
    } else if (tag.slice(0, 3) === 'abi') {
      tags.abi = tag.slice(3);
    } else if (tag.slice(0, 2) === 'uv') {
      tags.uv = tag.slice(2);
    } else if (tag.slice(0, 4) === 'armv') {
      tags.armv = tag.slice(4);
    } else if (tag === 'glibc' || tag === 'musl') {
      tags.libc = tag;
    } else {
      continue;
    }

    tags.specificity++;
  }

  return tags;
}

function matchTags(runtime, abi) {
  return function (tags) {
    if (!tags) return false;
    if (tags.runtime !== runtime && !runtimeAgnostic(tags)) return false;
    if (tags.abi !== abi && !tags.napi) return false;
    if (tags.uv && tags.uv !== uv) return false;
    if (tags.armv && tags.armv !== armv) return false;
    if (tags.libc && tags.libc !== libc) return false;

    return true;
  }
}

function runtimeAgnostic(tags) {
  return tags.runtime === 'node' && tags.napi;
}

function compareTags(runtime) {
  return function (a, b) {
    if (a.runtime !== b.runtime) {
      return a.runtime === runtime ? -1 : 1;
    } else if (a.abi !== b.abi) {
      return a.abi ? -1 : 1;
    } else if (a.specificity !== b.specificity) {
      return a.specificity > b.specificity ? -1 : 1;
    } else {
      return 0;
    }
  }
}

function isElectron() {
  if (process.versions && process.versions.electron) return true;
  return process.env.ELECTRON_RUN_AS_NODE || (typeof window !== 'undefined' && window.process && window.process.type === 'renderer');
}

function isAlpine(platform) {
  return platform === 'linux' && fs.existsSync('/etc/alpine-release');
}

// Exposed for unit tests
load.parseTags = parseTags;
load.matchTags = matchTags;
load.compareTags = compareTags;
