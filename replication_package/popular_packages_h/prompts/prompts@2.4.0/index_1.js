// Function that checks if the current Node.js version is less than a given target version
function isNodeLT(targetVersion) {
  // Convert the target version into an array of numbers if it is a string
  const target = (Array.isArray(targetVersion) ? targetVersion : targetVersion.split('.')).map(Number);

  // Get the current Node.js version and split it into an array of numbers
  const currentNodeVersion = process.versions.node.split('.').map(Number);

  // Iterate over the target version numbers
  for (let i = 0; i < target.length; i++) {
    // If a part of the current version is greater than the target, return false
    if (currentNodeVersion[i] > target[i]) return false;

    // If a part of the target version is greater than the current version, return true
    if (target[i] > currentNodeVersion[i]) return true;
  }
  // If all parts are equal, return false
  return false;
}

// Export the appropriate module based on the Node.js version check
module.exports = isNodeLT('8.6.0')
  ? require('./dist/index.js') // Use dist/index.js if Node version is less than 8.6.0
  : require('./lib/index.js');  // Use lib/index.js if Node version is 8.6.0 or higher
