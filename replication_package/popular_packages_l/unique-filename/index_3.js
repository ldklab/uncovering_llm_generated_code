const crypto = require('crypto');
const path = require('path');

// Function to generate a unique string based either on a provided string or randomly
function createUniqueIdentifier(input) {
  return input ? 
    // Create a deterministic hash if input is provided
    crypto.createHash('sha256').update(input).digest('hex').slice(0, 8) :
    // Generate a random string if no input is provided
    crypto.randomBytes(4).toString('hex');
}

// Function to generate a unique file path based on a directory and optional prefix and unique string
function generateUniqueFilePath(directory, prefix = '', uniqueString = null) {
  // Create unique identifier
  const uniqueIdentifier = createUniqueIdentifier(uniqueString);
  
  // Construct the filename using the provided prefix and unique identifier
  const filename = prefix ? `${prefix}-${uniqueIdentifier}` : uniqueIdentifier;

  // Return the full path combining the directory and filename
  return path.join(directory, filename);
}

module.exports = generateUniqueFilePath;

// Example Usage
// const os = require('os');
// console.log(generateUniqueFilePath(os.tmpdir())); // returns something like: '/tmp/3b9c5191'
// console.log(generateUniqueFilePath(os.tmpdir(), 'my-test')); // returns something like: '/tmp/my-test-3b9c5191'
// console.log(generateUniqueFilePath('/my-tmp-dir', 'testing', '/my/thing/to/uniq/on')); // returns deterministic, e.g., '/my-tmp-dir/testing-5f4dcc3b'
