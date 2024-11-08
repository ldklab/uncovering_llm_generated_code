/**
 * Function to check if the current Node.js version is less than a specified target version.
 * @param {string|array} tar - Target version as a string (e.g., '8.6.0') or an array (e.g., [8, 6, 0]).
 * @returns {boolean} - Returns true if the current Node.js version is less than the target version, otherwise false.
 */
function isNodeLT(tar) {
  // Convert the target version to an array of numbers if it's a string.
  tar = (Array.isArray(tar) ? tar : tar.split('.')).map(Number);

  // Get the current Node.js version as an array of numbers.
  const src = process.versions.node.split('.').map(Number);

  // Compare each segment of the Node.js version with the target version.
  for (let i = 0; i < tar.length; i++) {
    if (src[i] > tar[i]) return false;  // Current version segment is greater.
    if (tar[i] > src[i]) return true;   // Target version segment is greater.
  }
  return false;  // Versions are equal, or no segment of the current version is less than the target.
}

// Export different modules based on Node.js version comparison.
module.exports = isNodeLT('8.6.0')
  ? require('./dist/index.js')  // For versions less than 8.6.0
  : require('./lib/index.js');  // For versions 8.6.0 or newer
