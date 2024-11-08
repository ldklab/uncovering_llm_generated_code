const crypto = require('crypto');
const path = require('path');

/**
 * Generates a unique part of the filename based on either a unique string or random bytes.
 * 
 * @param {string|null} uniqstr - A string to use for deterministic hash generation or null to generate random.
 * @returns {string} - An 8-character string used to ensure filename uniqueness.
 */
function generateUniquePart(uniqstr) {
  if (uniqstr) {
    // Hash the unique string to ensure deterministic uniqueness
    return crypto.createHash('sha256').update(uniqstr).digest('hex').slice(0, 8);
  } else {
    // Create a random 8-character hexadecimal string
    return crypto.randomBytes(4).toString('hex');
  }
}

/**
 * Creates a unique filename within the specified directory, optionally prefixed and based on a uniqueness string.
 * 
 * @param {string} dir - The directory where the file will be placed.
 * @param {string} [fileprefix=''] - An optional prefix for the filename.
 * @param {string|null} [uniqstr=null] - A string used for deterministic uniqueness or null for randomness.
 * @returns {string} - The complete unique filename with path.
 */
function uniqueFilename(dir, fileprefix = '', uniqstr = null) {
  // Determine the unique portion of the filename
  const uniquePart = generateUniquePart(uniqstr);

  // Formulate the filename based on prefix
  const filename = fileprefix ? `${fileprefix}-${uniquePart}` : uniquePart;
  
  // Combine directory and filename into a full path
  return path.join(dir, filename);
}

module.exports = uniqueFilename;

// Example Usage
// const os = require('os');
// console.log(uniqueFilename(os.tmpdir())); // returns something like: '/tmp/3b9c5191'
// console.log(uniqueFilename(os.tmpdir(), 'my-test')); // returns something like: '/tmp/my-test-3b9c5191'
// console.log(uniqueFilename('/my-tmp-dir', 'testing', '/my/thing/to/uniq/on')); // returns deterministic, e.g., '/my-tmp-dir/testing-5f4dcc3b'
