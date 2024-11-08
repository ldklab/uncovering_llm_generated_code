const RESERVED_NODE_MODULES = [
  'http', 'stream', 'url', 'node_modules', 'favicon.ico'
];

function validatePackageName(packageName) {
  const violations = [];
  const advisories = [];

  if (typeof packageName !== 'string') {
    violations.push('Package name must be a string.');
  } else {
    if (packageName.length === 0) {
      violations.push('Package name cannot be empty.');
    }

    if (packageName.length > 214) {
      violations.push('Package name cannot exceed 214 characters.');
      advisories.push('Avoid using package names longer than 214 characters.');
    }

    if (/^[._]/.test(packageName)) {
      violations.push('Package name cannot start with a period or underscore.');
    }

    if (/\s/.test(packageName)) {
      violations.push('Package name cannot contain spaces.');
    }

    if (/[^a-z0-9-]/.test(packageName)) {
      violations.push('Package name should only include lowercased URL-safe characters.');
    }

    if (/[A-Z]/.test(packageName)) {
      violations.push('Package name should be lowercase only.');
      advisories.push('Uppercase letters are discouraged in package names.');
    }

    if (/[\~\)\(\'\!\*]/.test(packageName)) {
      violations.push('Package name cannot include special characters: ~)('!`*');
    }

    if (RESERVED_NODE_MODULES.includes(packageName)) {
      violations.push('Package name cannot duplicate Node.js core modules.');
    }
  }

  return compileResult(violations.length === 0, violations.length === 0 && advisories.length === 0, violations, advisories);
}

function compileResult(newPackageValid, oldPackageValid, violations = [], advisories = []) {
  const outcome = {
    validForNewPackages: newPackageValid,
    validForOldPackages: oldPackageValid
  };
  if (violations.length > 0) {
    outcome.errors = violations;
  }
  if (advisories.length > 0) {
    outcome.warnings = advisories;
  }
  return outcome;
}

module.exports = validatePackageName;

// Example Usage
console.log(validatePackageName("example-package"));
console.log(validatePackageName("http"));
console.log(validatePackageName(" leading-space:and:weirdchars"));
