const crypto = require('crypto');
const path = require('path');

function generateUniquePart(uniqstr) {
  if (uniqstr) {
    // Create a hash based on the given unique string for deterministic uniqueness
    return crypto.createHash('sha256').update(uniqstr).digest('hex').slice(0, 8);
  } else {
    // Generate a random 8 character string
    return crypto.randomBytes(4).toString('hex');
  }
}

function uniqueFilename(dir, fileprefix = '', uniqstr = null) {
  // Generate the unique part of the filename
  const uniquePart = generateUniquePart(uniqstr);

  // Construct the filename
  let filename = uniquePart;
  if (fileprefix && fileprefix.length > 0) {
    filename = `${fileprefix}-${uniquePart}`;
  }
  
  // Return the full path
  return path.join(dir, filename);
}

module.exports = uniqueFilename;

// Example Usage
// const os = require('os');
// console.log(uniqueFilename(os.tmpdir())); // returns something like: '/tmp/3b9c5191'
// console.log(uniqueFilename(os.tmpdir(), 'my-test')); // returns something like: '/tmp/my-test-3b9c5191'
// console.log(uniqueFilename('/my-tmp-dir', 'testing', '/my/thing/to/uniq/on')); // returns deterministic, e.g., '/my-tmp-dir/testing-5f4dcc3b'
