// semver-rewrite.js

class SemVer {
  constructor(version) {
    const parsed = this.constructor.parse(version);
    if (!parsed) throw new Error(`Invalid version: ${version}`);
    Object.assign(this, parsed);
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
    other = other instanceof SemVer ? other : new SemVer(other);
    return this._compare(this.major, other.major) ||
           this._compare(this.minor, other.minor) ||
           this._compare(this.patch, other.patch) ||
           this._compareArrays(this.prerelease, other.prerelease) ||
           this._compareArrays(this.build, other.build);
  }

  _compare(a, b) {
    return (a > b) - (a < b);
  }

  _compareArrays(a, b) {
    const minLength = Math.min(a.length, b.length);
    for (let i = 0; i < minLength; i++) {
      const result = this._compare(a[i], b[i]);
      if (result) return result;
    }
    return this._compare(a.length, b.length);
  }

  increment(type, identifier) {
    switch (type) {
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
        throw new Error(`Invalid release type: ${type}`);
    }
    return this;
  }
}

function valid(version) {
  try {
    return new SemVer(version).format();
  } catch {
    return null;
  }
}

function clean(version) {
  const semver = valid(version.trim());
  return semver ? semver.replace(/^v/, '') : null;
}

function satisfies(version, range) {
  const [operator, rangeVersion] = range.match(/^([<>=]*)?([\d\.]+)/).slice(1, 3);
  const semver = new SemVer(version);
  const rangeSemver = new SemVer(rangeVersion);
  const comparison = semver.compare(rangeSemver);
  return operator === '=' ? comparison === 0 :
         operator === '>' ? comparison > 0 :
         operator === '>=' ? comparison >= 0 :
         operator === '<' ? comparison < 0 :
         operator === '<=' ? comparison <= 0 : false;
}

module.exports = {
  valid,
  clean,
  SemVer,
  compare: (v1, v2) => new SemVer(v1).compare(v2),
  satisfies
};

// Usage Example:

const semver = require('./semver-rewrite');

console.log(semver.valid('1.2.3')); // '1.2.3'
console.log(semver.clean('  =v1.2.3   ')); // '1.2.3'
console.log(semver.satisfies('1.2.3', '>=1.0.0')); // true
