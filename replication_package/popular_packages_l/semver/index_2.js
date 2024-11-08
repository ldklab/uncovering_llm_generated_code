// semver.js

class SemVer {
  constructor(version) {
    const parsed = SemVer.parse(version);
    if (!parsed) {
      throw new Error(`Invalid version: ${version}`);
    }
    this.major = parsed.major;
    this.minor = parsed.minor;
    this.patch = parsed.patch;
    this.prerelease = parsed.prerelease || [];
    this.build = parsed.build || [];
  }

  static parse(version) {
    const regex = /^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>[\da-z\-\.]+))?(?:\+(?<build>[\da-z\-\.]+))?$/i;
    const match = version.trim().match(regex);
    if (!match) return null;
    const { groups } = match;
    return {
      major: parseInt(groups.major, 10),
      minor: parseInt(groups.minor, 10),
      patch: parseInt(groups.patch, 10),
      prerelease: groups.prerelease ? groups.prerelease.split('.') : [],
      build: groups.build ? groups.build.split('.') : []
    };
  }

  format() {
    let version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) version += `-${this.prerelease.join('.')}`;
    if (this.build.length) version += `+${this.build.join('.')}`;
    return version;
  }

  compare(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other);
    }
    if (this.major !== other.major) return compareInts(this.major, other.major);
    if (this.minor !== other.minor) return compareInts(this.minor, other.minor);
    if (this.patch !== other.patch) return compareInts(this.patch, other.patch);

    const preCompare = compareArrays(this.prerelease, other.prerelease);
    if (preCompare !== 0) return preCompare;

    return compareArrays(this.build, other.build);
  }

  increment(release, identifier) {
    switch (release) {
      case 'pre':
        this.prerelease = [identifier || '0'];
        break;
      case 'patch':
        this.patch++;
        this.prerelease = [];
        break;
      case 'minor':
        this.minor++;
        this.patch = 0;
        this.prerelease = [];
        break;
      case 'major':
        this.major++;
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;
      default:
        throw new Error(`Invalid release type: ${release}`);
    }
    return this;
  }
}

function compareInts(a, b) {
  return (a > b) - (a < b);
}

function compareArrays(a, b) {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) {
      return isNaN(a[i]) || isNaN(b[i]) ? compareStrings(a[i], b[i]) : compareInts(parseInt(a[i]), parseInt(b[i]));
    }
  }
  return compareInts(a.length, b.length);
}

function compareStrings(a, b) {
  return a.localeCompare(b);
}

function valid(version) {
  try {
    const semver = new SemVer(version);
    return semver.format();
  } catch {
    return null;
  }
}

function clean(version) {
  const trimmed = version.trim();
  const semver = valid(trimmed);
  if (!semver) return null;
  return semver.replace(/^v/, '').trim();
}

function satisfies(version, range) {
  const [rangeOperator, rangeVersion] = parseRange(range);
  const semver = new SemVer(version);
  const rangeSemver = new SemVer(rangeVersion);
  return satisfiesComparator(semver, rangeOperator, rangeSemver);
}

function parseRange(range) {
  const [operator, version] = range.match(/^([<>=]*)?([\d\.]+)/).slice(1, 3);
  return [operator || '=', version];
}

function satisfiesComparator(semver, operator, rangeSemver) {
  const comparison = semver.compare(rangeSemver);
  switch (operator) {
    case '=':
      return comparison === 0;
    case '>':
      return comparison > 0;
    case '>=':
      return comparison >= 0;
    case '<':
      return comparison < 0;
    case '<=':
      return comparison <= 0;
    default:
      return false;
  }
}

module.exports = {
  valid,
  clean,
  SemVer,
  compare: (v1, v2) => new SemVer(v1).compare(v2),
  satisfies
};

// Usage Example:

const semver = require('./semver');

console.log(semver.valid('1.2.3')); // '1.2.3'
console.log(semver.clean('  =v1.2.3   ')); // '1.2.3'
console.log(semver.satisfies('1.2.3', '>=1.0.0')); // true
