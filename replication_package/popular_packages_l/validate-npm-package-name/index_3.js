const nodeCoreModules = [
  'http', 'stream', 'url', 'node_modules', 'favicon.ico'
];

// Function to validate an npm package name
function validateNpmPackageName(name) {
  const errors = [];
  const warnings = [];

  // Check if name is a string
  if (typeof name !== 'string') {
    errors.push('name must be a string');
    return createValidationResult(false, false, errors);
  }

  // Check name length
  if (name.length === 0) {
    errors.push('name length must be greater than zero');
  }

  if (name.length > 214) {
    errors.push('name length must not exceed 214 characters');
    warnings.push('name can no longer contain more than 214 characters');
  }

  // Check if name starts with a period or underscore
  if (/^[._]/.test(name)) {
    errors.push('name cannot start with a period or an underscore');
  }

  // Check if name contains spaces
  if (/\s/.test(name)) {
    errors.push('name cannot contain leading or trailing spaces');
  }

  // Ensure name contains only URL-friendly characters
  if (/[^a-z0-9-]/.test(name)) {
    errors.push('name can only contain URL-friendly characters');
  }

  // Check for uppercase letters in name
  if (/[A-Z]/.test(name)) {
    errors.push('name cannot contain uppercase letters');
    warnings.push('name can no longer contain capital letters');
  }

  // Check for special characters in name
  if (/[\~\)\(\'\!\*]/.test(name)) {
    errors.push('name cannot contain special characters: ~)('!`*');
  }

  // Check if name is a node.js core module
  if (nodeCoreModules.includes(name)) {
    errors.push('name cannot be the same as a node.js core module');
  }

  // Return validation results
  return createValidationResult(errors.length === 0, errors.length === 0 && warnings.length === 0, errors, warnings);
}

// Helper function to format result
function createValidationResult(isValidForNew, isValidForOld, errors = [], warnings = []) {
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
