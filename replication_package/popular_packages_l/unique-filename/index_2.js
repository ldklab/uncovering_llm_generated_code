const crypto = require('crypto');
const path = require('path');

/**
 * Generates a unique string component for filenames.
 * If a specific unique string is provided, it deterministically generates a hash
 * based on that string. If not, it generates a random 8-character hexadecimal string.
 *
 * @param {string|null} uniqstr - A string used to create a unique hash, or null for randomness.
 * @returns {string} The generated 8-character unique string.
 */
function generateUniquePart(uniqstr) {
  if (uniqstr) {
    // Create a hash based on the given unique string
    return crypto.createHash('sha256').update(uniqstr).digest('hex').slice(0, 8);
  } else {
    // Generate a random string if no unique string provided
    return crypto.randomBytes(4).toString('hex');
  }
}

/**
 * Constructs a unique filename in a specified directory with an optional prefix.
 * 
 * @param {string} dir - The directory path where the file should be located.
 * @param {string} [fileprefix=''] - An optional prefix for the filename.
 * @param {string|null} [uniqstr=null] - A string for deterministic unique file naming.
 * @returns {string} The full path with the unique filename.
 */
function uniqueFilename(dir, fileprefix = '', uniqstr = null) {
  // Generate the unique part of the filename
  const uniquePart = generateUniquePart(uniqstr);

  // Construct the filename with optional prefix
  const filename = fileprefix ? `${fileprefix}-${uniquePart}` : uniquePart;
  
  // Return the full file path
  return path.join(dir, filename);
}

module.exports = uniqueFilename;

// Example Usage
// const os = require('os');
// console.log(uniqueFilename(os.tmpdir())); // returns something like: '/tmp/3b9c5191'
// console.log(uniqueFilename(os.tmpdir(), 'my-test')); // returns something like: '/tmp/my-test-3b9c5191'
// console.log(uniqueFilename('/my-tmp-dir', 'testing', '/my/thing/to/uniq/on')); // returns deterministic, e.g., '/my-tmp-dir/testing-5f4dcc3b'
