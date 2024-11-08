const nodeCoreModules = [
  'http', 'stream', 'url', 'node_modules', 'favicon.ico'
];

function validateNpmPackageName(name) {
  const errors = [];
  const warnings = [];

  if (typeof name !== 'string') {
    errors.push('name must be a string');
    return formatResult(false, false, errors);
  }

  if (name.length === 0) {
    errors.push('name length must be greater than zero');
  }

  if (name.length > 214) {
    errors.push('name length must not exceed 214 characters');
    warnings.push('name can no longer contain more than 214 characters');
  }

  if (/^[._]/.test(name)) {
    errors.push('name cannot start with a period or an underscore');
  }

  if (/\s/.test(name)) {
    errors.push('name cannot contain leading or trailing spaces');
  }

  if (/[^a-z0-9-]/.test(name)) {
    errors.push('name can only contain URL-friendly characters');
  }

  if (/[A-Z]/.test(name)) {
    errors.push('name cannot contain uppercase letters');
    warnings.push('name can no longer contain capital letters');
  }

  if (/[\~\)\(\'\!\*]/.test(name)) {
    errors.push('name cannot contain special characters: ~)('!`*');
  }

  if (nodeCoreModules.includes(name)) {
    errors.push('name cannot be the same as a node.js core module');
  }

  return formatResult(errors.length === 0, errors.length === 0 && warnings.length === 0, errors, warnings);
}

function formatResult(isValidForNew, isValidForOld, errors = [], warnings = []) {
  const result = {
    validForNewPackages: isValidForNew,
    validForOldPackages: isValidForOld
  };
  if (errors.length > 0) {
    result.errors = errors;
  }
  if (warnings.length > 0) {
    result.warnings = warnings;
  }
  return result;
}

module.exports = validateNpmPackageName;

// Example Usage
console.log(validateNpmPackageName("some-package"));
console.log(validateNpmPackageName("http"));
console.log(validateNpmPackageName(" leading-space:and:weirdchars"));
