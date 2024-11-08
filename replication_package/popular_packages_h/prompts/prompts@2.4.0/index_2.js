// This function checks if the current version of Node.js (the version the process is running on)
// is less than a specified target version ('tar').

function isNodeLT(targetVersion) {
  // If 'targetVersion' is not an array, split it into an array by the '.' character and convert each part to a number.
  targetVersion = (Array.isArray(targetVersion) ? targetVersion : targetVersion.split('.')).map(Number);

  // Get the current Node.js version, split it by '.', and convert each part to a number.
  let currentVersion = process.versions.node.split('.').map(Number);

  // Compare each part of the versions.
  for (let i = 0; i < targetVersion.length; i++) {
    if (currentVersion[i] > targetVersion[i]) {
      // If current version part is greater than target version part, current version is not less than target.
      return false;
    }
    if (targetVersion[i] > currentVersion[i]) {
      // If target version part is greater than current version part, current version is less than target.
      return true;
    }
  }
  // If all parts are equal, current Node.js version is not less than target version.
  return false;
}

// Depending on the result of the isNodeLT function, export a different module.
module.exports = isNodeLT('8.6.0') ? require('./dist/index.js') : require('./lib/index.js');
