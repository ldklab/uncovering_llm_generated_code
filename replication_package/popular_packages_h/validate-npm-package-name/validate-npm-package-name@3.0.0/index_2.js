'use strict';

const scopedPackagePattern = /^(?:@([^/]+?)[/])?([^/]+?)$/;
const builtins = require('builtins');
const blacklist = ['node_modules', 'favicon.ico'];

function validate(name) {
  const warnings = [];
  const errors = [];
  const urlFriendlyPattern = /[~'!()*]/;

  if (name === null) {
    return done(['name cannot be null'], errors);
  }

  if (name === undefined) {
    return done(['name cannot be undefined'], errors);
  }
  
  if (typeof name !== 'string') {
    return done(['name must be a string'], errors);
  }

  if (name.length === 0) {
    errors.push('name length must be greater than zero');
  }

  if (name.startsWith('.')) {
    errors.push('name cannot start with a period');
  }

  if (name.startsWith('_')) {
    errors.push('name cannot start with an underscore');
  }

  if (name.trim() !== name) {
    errors.push('name cannot contain leading or trailing spaces');
  }

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

  if (urlFriendlyPattern.test(name.split('/').slice(-1)[0])) {
    warnings.push('name can no longer contain special characters ("~\'!()*")');
  }

  if (encodeURIComponent(name) !== name) {
    const matched = name.match(scopedPackagePattern);
    if (matched) {
      const user = matched[1];
      const pkg = matched[2];
      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return done(warnings, errors);
      }
    }
    errors.push('name can only contain URL-friendly characters');
  }

  return done(warnings, errors);
}

validate.scopedPackagePattern = scopedPackagePattern;

function done(warnings, errors) {
  const result = {
    validForNewPackages: !errors.length && !warnings.length,
    validForOldPackages: !errors.length,
    warnings: warnings.length ? warnings : undefined,
    errors: errors.length ? errors : undefined
  };
  return result;
}

module.exports = validate;
