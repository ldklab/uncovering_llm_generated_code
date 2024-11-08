const fs = require('fs');
const path = require('path');
const os = require('os');

const runtimeRequire = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

const vars = (process.config && process.config.variables) || {};
const prebuildsOnly = !!process.env.PREBUILDS_ONLY;
const abi = process.versions.modules;
const runtime = determineRuntime();
const arch = os.arch();
const platform = os.platform();
const libc = process.env.LIBC || (isAlpine(platform) ? 'musl' : 'glibc');
const armv = process.env.ARM_VERSION || (arch === 'arm64' ? '8' : vars.arm_version) || '';
const uv = (process.versions.uv || '').split('.')[0];

function determineRuntime() {
  if (process.versions && process.versions.electron) return 'electron';
  return 'node';
}

function load(dir) {
  return runtimeRequire(load.path(dir));
}

load.path = function(dir) {
  dir = path.resolve(dir || '.');

  let packageName;
  try {
    packageName = runtimeRequire(path.join(dir, 'package.json')).name.toUpperCase().replace(/-/g, '_');
    if (process.env[`${packageName}_PREBUILD`]) dir = process.env[`${packageName}_PREBUILD`];
  } catch (err) {}

  if (!prebuildsOnly) {
    const release = getFirst(path.join(dir, 'build/Release'), isNodeFile);
    if (release) return release;

    const debug = getFirst(path.join(dir, 'build/Debug'), isNodeFile);
    if (debug) return debug;
  }

  const prebuild = resolve(dir);
  if (prebuild) return prebuild;

  const nearby = resolve(path.dirname(process.execPath));
  if (nearby) return nearby;

  const targetInfo = generateTargetInfo();
  throw new Error(`No native build was found for ${targetInfo}\n    loaded from: ${dir}\n`);

  function resolve(directory) {
    const prebuildsDir = path.join(directory, 'prebuilds', `${platform}-${arch}`);
    const parsed = readDirectory(prebuildsDir).map(parseTags);
    const candidates = parsed.filter(tagMatches(runtime, abi));
    const bestCandidate = candidates.sort(tagComparator(runtime))[0];
    return bestCandidate && path.join(prebuildsDir, bestCandidate.file);
  }
};

function generateTargetInfo() {
  const target = [
    `platform=${platform}`,
    `arch=${arch}`,
    `runtime=${runtime}`,
    `abi=${abi}`,
    `uv=${uv}`,
    armv ? `armv=${armv}` : '',
    `libc=${libc}`,
    `node=${process.versions.node}`,
    process.versions.electron ? `electron=${process.versions.electron}` : '',
    typeof __webpack_require__ === 'function' ? 'webpack=true' : ''
  ];
  return target.filter(Boolean).join(' ');
}

function readDirectory(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (err) {
    return [];
  }
}

function getFirst(dir, filter) {
  const files = readDirectory(dir).filter(filter);
  return files[0] && path.join(dir, files[0]);
}

function isNodeFile(name) {
  return name.endsWith('.node');
}

function parseTags(file) {
  const parts = file.split('.');
  const extension = parts.pop();
  if (extension !== 'node') return null;

  const tags = { file, specificity: 0 };
  parts.forEach(part => {
    switch (true) {
      case /^node|electron|node-webkit$/.test(part):
        tags.runtime = part;
        break;
      case part === 'napi':
        tags.napi = true;
        break;
      case part.startsWith('abi'):
        tags.abi = part.slice(3);
        break;
      case part.startsWith('uv'):
        tags.uv = part.slice(2);
        break;
      case part.startsWith('armv'):
        tags.armv = part.slice(4);
        break;
      case part === 'glibc' || part === 'musl':
        tags.libc = part;
        break;
      default:
        return;
    }
    tags.specificity++;
  });
  return tags;
}

function tagMatches(runtime, abi) {
  return function(tags) {
    if (!tags) return false;
    if (tags.runtime !== runtime && !isRuntimeAgnostic(tags)) return false;
    if (tags.abi !== abi && !tags.napi) return false;
    if (tags.uv && tags.uv !== uv) return false;
    if (tags.armv && tags.armv !== armv) return false;
    if (tags.libc && tags.libc !== libc) return false;

    return true;
  };
}

function isRuntimeAgnostic(tags) {
  return tags.runtime === 'node' && tags.napi;
}

function tagComparator(runtime) {
  return (a, b) => {
    if (a.runtime !== b.runtime) {
      return a.runtime === runtime ? -1 : 1;
    }
    if (a.abi !== b.abi) {
      return a.abi ? -1 : 1;
    }
    return a.specificity > b.specificity ? -1 : 1;
  };
}

function isElectron() {
  return !!(process.versions && process.versions.electron) ||
         !!process.env.ELECTRON_RUN_AS_NODE ||
         (typeof window !== 'undefined' && window.process && window.process.type === 'renderer');
}

function isAlpine(platform) {
  return platform === 'linux' && fs.existsSync('/etc/alpine-release');
}

module.exports = load;
load.parseTags = parseTags;
load.matchTags = tagMatches;
load.compareTags = tagComparator;
