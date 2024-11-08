function isNodeLT(targetVersion) {
  // Split the target version into an array of numbers
  targetVersion = (Array.isArray(targetVersion) ? targetVersion : targetVersion.split('.')).map(Number);
  
  // Split the current Node.js version into an array of numbers
  let currentIndex = 0;
  const currentVersion = process.versions.node.split('.').map(Number);
  
  // Compare each segment of the Node.js version to the target version
  for (; currentIndex < targetVersion.length; currentIndex++) {
    if (currentVersion[currentIndex] > targetVersion[currentIndex]) return false;
    if (targetVersion[currentIndex] > currentVersion[currentIndex]) return true;
  }
  
  // If all segments are equal, return false
  return false;
}

// Check if current Node.js version is less than 8.6.0
module.exports =
  isNodeLT('8.6.0')
    ? require('./dist/index.js')  // Use dist/index.js for Node.js versions less than 8.6.0
    : require('./lib/index.js');  // Use lib/index.js for Node.js versions 8.6.0 or greater
