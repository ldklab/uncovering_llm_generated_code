// Function to check if the current Node.js version is less than the target version
function isNodeLT(targetVersion) {
  // Convert the target version into an array of numbers if it is not already an array
  targetVersion = (Array.isArray(targetVersion) ? targetVersion : targetVersion.split('.')).map(Number);
  
  // Get current Node.js version as an array of numbers
  let currentVersion = process.versions.node.split('.').map(Number);

  // Compare each component of the version numbers
  for (let i = 0; i < targetVersion.length; i++) {
    // If the current version component is greater, return false
    if (currentVersion[i] > targetVersion[i]) return false;
    // If the target version component is greater, return true
    if (targetVersion[i] > currentVersion[i]) return true;
  }

  // If all components are equal, return false
  return false;
}

// Export a module based on the version check
module.exports = isNodeLT('8.6.0') 
  ? require('./dist/index.js') 
  : require('./lib/index.js');
