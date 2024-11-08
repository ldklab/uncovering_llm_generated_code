// This function checks if the current Node.js version is less than the specified target version.
function isNodeLT(targetVersion) {
  // Convert the target version into an array of numbers.
  targetVersion = (Array.isArray(targetVersion) ? targetVersion : targetVersion.split('.')).map(Number);
  
  // Get the current Node.js version and convert it into an array of numbers.
  const currentVersion = process.versions.node.split('.').map(Number);
  
  // Iterate through each component (major, minor, patch) of the version.
  for (let i = 0; i < targetVersion.length; i++) {
    // If the current Node.js version component is greater than the target, return false.
    if (currentVersion[i] > targetVersion[i]) return false;
    // If the target version component is greater, return true.
    if (targetVersion[i] > currentVersion[i]) return true;
  }
  
  // If versions are the same, return false.
  return false;
}

// Exports different modules based on whether the current Node.js version is less than 8.6.0.
module.exports = isNodeLT('8.6.0') ? require('./dist/index.js') : require('./lib/index.js');
