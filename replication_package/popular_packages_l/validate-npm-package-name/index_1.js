const nodeCoreModules = [
  'http', 'stream', 'url', 'node_modules', 'favicon.ico'
];

function validateNpmPackageName(name) {
  const errors = [];
  const warnings = [];

  // Ensure name is a string
  if (typeof name !== 'string') {
    errors.push('name must be a string');
    return formatResult(false, false, errors);
  }

  // Check the length constraints
  if (name.length === 0) {
    errors.push('name length must be greater than zero');
  } else if (name.length > 214) {
    errors.push('name length must not exceed 214 characters');
    warnings.push('name can no longer contain more than 214 characters');
  }

  // Disallow names starting with '.' or '_'
  if (/^[._]/.test(name)) {
    errors.push('name cannot start with a period or an underscore');
  }

  // Check for whitespace
  if (/\s/.test(name)) {
    errors.push('name cannot contain leading or trailing spaces');
  }

  // Ensure name has only URL-friendly characters
  if (/[^a-z0-9-]/.test(name)) {
    errors.push('name can only contain URL-friendly characters');
  }

  // Enforce lowercase letters only
  if (/[A-Z]/.test(name)) {
    errors.push('name cannot contain uppercase letters');
    warnings.push('name can no longer contain capital letters');
  }

  // Disallow special characters
  if (/[\~\)\(\'\!\*]/.test(name)) {
    errors.push('name cannot contain special characters: ~)('[`*');
  }

  // Ensure name is not a core module of Node.js
  if (nodeCoreModules.includes(name)) {
    errors.push('name cannot be the same as a node.js core module');
  }

  // Return formatted result
  return formatResult(errors.length === 0, errors.length === 0 && warnings.length === 0, errors, warnings);
}

function formatResult(isValidForNew, isValidForOld, errors = [], warnings = []) {
  return {
    validForNewPackages: isValidForNew,
    validForOldPackages: isValidForOld,
    ...(errors.length > 0 && { errors }),
    ...(warnings.length > 0 && { warnings })
  };
}

module.exports = validateNpmPackageName;

// Example Usage
console.log(validateNpmPackageName("some-package"));
console.log(validateNpmPackageName("http"));
console.log(validateNpmPackageName(" leading-space:and:weirdchars"));
