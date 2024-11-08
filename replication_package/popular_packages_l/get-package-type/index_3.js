const fs = require('fs');
const path = require('path');

/**
 * Asynchronously retrieves the package type from the package.json file.
 * Defaults to 'commonjs' if not defined or on error.
 *
 * @param {string} filePath - The path to a file within the package directory.
 * @returns {Promise<string>} - The package type as defined in package.json or 'commonjs'.
 */
async function getPackageType(filePath) {
  // Resolve the directory path from the given file path
  const dirPath = path.dirname(filePath);
  // Construct the path to package.json
  const packageJsonPath = path.join(dirPath, 'package.json');

  try {
    // Read the package.json file asynchronously
    const data = await fs.promises.readFile(packageJsonPath, 'utf8');
    // Parse the JSON data
    const packageJson = JSON.parse(data);
    // Return the type if it exists, otherwise default to 'commonjs'
    return packageJson.type || 'commonjs';
  } catch (err) {
    // Handle the error if package.json is missing or path is invalid
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return 'commonjs';
    } else {
      throw err;
    }
  }
}

/**
 * Synchronously retrieves the package type from the package.json file.
 * Defaults to 'commonjs' if not defined or on error.
 *
 * @param {string} filePath - The path to a file within the package directory.
 * @returns {string} - The package type as defined in package.json or 'commonjs'.
 */
function getPackageTypeSync(filePath) {
  // Resolve the directory path from the given file path
  const dirPath = path.dirname(filePath);
  // Construct the path to package.json
  const packageJsonPath = path.join(dirPath, 'package.json');

  try {
    // Read the package.json file synchronously
    const data = fs.readFileSync(packageJsonPath, 'utf8');
    // Parse the JSON data
    const packageJson = JSON.parse(data);
    // Return the type if it exists, otherwise default to 'commonjs'
    return packageJson.type || 'commonjs';
  } catch (err) {
    // Handle the error if package.json is missing or path is invalid
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return 'commonjs';
    } else {
      throw err;
    }
  }
}

// Export the functions for external usage
module.exports = getPackageType;
module.exports.sync = getPackageTypeSync;
