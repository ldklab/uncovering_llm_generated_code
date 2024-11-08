// semver.js

class SemVer {
  constructor(version) {
    const parsedVersion = SemVer.parseVersion(version);
    if (!parsedVersion) {
      throw new Error(`Invalid version: ${version}`);
    }
    this.major = parsedVersion.major;
    this.minor = parsedVersion.minor;
    this.patch = parsedVersion.patch;
    this.prerelease = parsedVersion.prerelease || [];
    this.build = parsedVersion.build || [];
  }

  static parseVersion(versionString) {
    const versionRegex = /^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>[\da-z\-\.]+))?(?:\+(?<build>[\da-z\-\.]+))?$/i;
    const matchResult = versionString.trim().match(versionRegex);
    if (!matchResult) return null;
    
    const { groups } = matchResult;
    
    return {
      major: parseInt(groups.major, 10),
      minor: parseInt(groups.minor, 10),
      patch: parseInt(groups.patch, 10),
      prerelease: groups.prerelease ? groups.prerelease.split('.') : [],
      build: groups.build ? groups.build.split('.') : []
    };
  }

  format() {
    let formattedVersion = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) formattedVersion += `-${this.prerelease.join('.')}`;
    if (this.build.length) formattedVersion += `+${this.build.join('.')}`;
    return formattedVersion;
  }

  compare(otherVersion) {
    if (!(otherVersion instanceof SemVer)) {
      otherVersion = new SemVer(otherVersion);
    }

    if (this.major !== otherVersion.major) return compareIntegers(this.major, otherVersion.major);
    if (this.minor !== otherVersion.minor) return compareIntegers(this.minor, otherVersion.minor);
    if (this.patch !== otherVersion.patch) return compareIntegers(this.patch, otherVersion.patch);

    const prereleaseComparison = compareLists(this.prerelease, otherVersion.prerelease);
    if (prereleaseComparison !== 0) return prereleaseComparison;

    return compareLists(this.build, otherVersion.build);
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
        throw new Error(`Invalid type: ${type}`);
    }
    return this;
  }
}

function compareIntegers(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

function compareLists(listA, listB) {
  const lengthToCompare = Math.min(listA.length, listB.length);
  for (let i = 0; i < lengthToCompare; i++) {
    if (listA[i] !== listB[i]) {
      return compareIntegers(listA[i], listB[i]);
    }
  }
  return compareIntegers(listA.length, listB.length);
}

function valid(versionString) {
  try {
    const semverInstance = new SemVer(versionString);
    return semverInstance.format();
  } catch {
    return null;
  }
}

function clean(versionString) {
  const cleanedVersion = versionString.trim();
  const validatedVersion = valid(cleanedVersion);
  if (!validatedVersion) return null;
  
  return validatedVersion.replace(/^v/, '').trim();
}

function satisfies(versionString, range) {
  const [rangeOperator, rangeVersion] = splitRange(range);
  const semverInstance = new SemVer(versionString);
  const rangeSemVer = new SemVer(rangeVersion);

  return evaluateSatisfaction(semverInstance, rangeOperator, rangeSemVer);
}

function splitRange(rangeString) {
  const [operator, version] = rangeString.match(/^([<>=]*)?([\d\.]+)/).slice(1, 3);
  return [operator || '=', version];
}

function evaluateSatisfaction(semver, operator, rangeSemver) {
  const comparisonResult = semver.compare(rangeSemver);
  switch (operator) {
    case '=': return comparisonResult === 0;
    case '>': return comparisonResult > 0;
    case '>=': return comparisonResult >= 0;
    case '<': return comparisonResult < 0;
    case '<=': return comparisonResult <= 0;
    default: return false;
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
