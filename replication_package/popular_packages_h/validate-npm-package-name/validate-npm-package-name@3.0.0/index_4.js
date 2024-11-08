'use strict';

const builtins = require('builtins');
const blacklist = ['node_modules', 'favicon.ico'];
const scopedPackagePattern = /^(?:@([^/]+?)[/])?([^/]+?)$/;

function validate(name) {
  const warnings = [];
  const errors = [];

  if (name === null) {
    errors.push('name cannot be null');
    return createResult(warnings, errors);
  }

  if (name === undefined) {
    errors.push('name cannot be undefined');
    return createResult(warnings, errors);
  }

  if (typeof name !== 'string') {
    errors.push('name must be a string');
    return createResult(warnings, errors);
  }

  if (!name.length) errors.push('name length must be greater than zero');
  if (/^\./.test(name)) errors.push('name cannot start with a period');
  if (/^_/.test(name)) errors.push('name cannot start with an underscore');
  if (name.trim() !== name) errors.push('name cannot contain leading or trailing spaces');

  blacklist.forEach(blacklistedName => {
    if (name.toLowerCase() === blacklistedName) {
      errors.push(`${blacklistedName} is a blacklisted name`);
    }
  });

  builtins.forEach(builtin => {
    if (name.toLowerCase() === builtin) {
      warnings.push(`${builtin} is a core module name`);
    }
  });

  if (name.length > 214) {
    warnings.push('name can no longer contain more than 214 characters');
  }

  if (name.toLowerCase() !== name) {
    warnings.push('name can no longer contain capital letters');
  }

  if (/[~'!()*]/.test(name.split('/').pop())) {
    warnings.push('name can no longer contain special characters ("~\'!()*")');
  }

  if (encodeURIComponent(name) !== name) {
    const nameMatch = name.match(scopedPackagePattern);
    if (nameMatch) {
      const [user, pkg] = [nameMatch[1], nameMatch[2]];
      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return createResult(warnings, errors);
      }
    }
    errors.push('name can only contain URL-friendly characters');
  }

  return createResult(warnings, errors);
}

validate.scopedPackagePattern = scopedPackagePattern;

function createResult(warnings, errors) {
  const result = {
    validForNewPackages: errors.length === 0 && warnings.length === 0,
    validForOldPackages: errors.length === 0,
    warnings: warnings.length ? warnings : undefined,
    errors: errors.length ? errors : undefined
  };
  return result;
}

module.exports = validate;
