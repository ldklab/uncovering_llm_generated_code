'use strict';

const builtins = require('builtins');
const scopedPackagePattern = /^(?:@([^/]+?)[/])?([^/]+?)$/;
const blacklist = ['node_modules', 'favicon.ico'];

function validate(name) {
  const warnings = [];
  const errors = [];

  if (name === null) return prepareResult(errors.push('name cannot be null'));
  if (name === undefined) return prepareResult(errors.push('name cannot be undefined'));
  if (typeof name !== 'string') return prepareResult(errors.push('name must be a string'));
  if (!name.length) errors.push('name length must be greater than zero');
  if (/^\./.test(name)) errors.push('name cannot start with a period');
  if (/^_/.test(name)) errors.push('name cannot start with an underscore');
  if (name.trim() !== name) errors.push('name cannot contain leading or trailing spaces');

  blacklist.forEach(item => {
    if (name.toLowerCase() === item) errors.push(`${item} is a blacklisted name`);
  });

  builtins.forEach(builtin => {
    if (name.toLowerCase() === builtin) warnings.push(`${builtin} is a core module name`);
  });

  if (name.length > 214) warnings.push('name can no longer contain more than 214 characters');
  if (name.toLowerCase() !== name) warnings.push('name can no longer contain capital letters');
  if (/[~'!()*]/.test(name.split('/').slice(-1)[0])) warnings.push('name can no longer contain special characters ("~\'!()*")');

  if (encodeURIComponent(name) !== name) {
    const nameMatch = name.match(scopedPackagePattern);
    if (nameMatch) {
      const [_, user, pkg] = nameMatch;
      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return prepareResult(warnings, errors);
      }
    }
    errors.push('name can only contain URL-friendly characters');
  }

  return prepareResult(warnings, errors);
}

validate.scopedPackagePattern = scopedPackagePattern;

function prepareResult(warnings, errors) {
  const result = {
    validForNewPackages: errors.length === 0 && warnings.length === 0,
    validForOldPackages: errors.length === 0,
    warnings: warnings.length ? warnings : undefined,
    errors: errors.length ? errors : undefined
  };
  return result;
}

module.exports = validate;
