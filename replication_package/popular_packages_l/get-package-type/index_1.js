const fs = require('fs');
const path = require('path');

/**
 * Asynchronously retrieves the package type based on a given file path.
 * If a `package.json` file is found in the directory of the specified file path,
 * this function parses the JSON to check for the `type` field (typically 'module' or 'commonjs').
 * If `package.json` does not exist, the directory is invalid, or the `type` is not specified,
 * it defaults to 'commonjs'.
 *
 * @param {string} filePath - The path to the file whose containing directory is checked for `package.json`.
 * @returns {Promise<string>} The type defined in `package.json` or 'commonjs' if not specified.
 */
async function getPackageType(filePath) {
  const dirPath = path.dirname(filePath);
  const packageJsonPath = path.join(dirPath, 'package.json');

  try {
    const data = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);
    return packageJson.type || 'commonjs';
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return 'commonjs';
    } else {
      throw err;
    }
  }
}

/**
 * Synchronously retrieves the package type based on a given file path.
 * It functions similarly to `getPackageType` but is synchronous, using blocking I/O operations.
 *
 * @param {string} filePath - The path to the file to check for `package.json`.
 * @returns {string} The type defined in `package.json` or 'commonjs' if not specified.
 */
function getPackageTypeSync(filePath) {
  const dirPath = path.dirname(filePath);
  const packageJsonPath = path.join(dirPath, 'package.json');

  try {
    const data = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);
    return packageJson.type || 'commonjs';
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return 'commonjs';
    } else {
      throw err;
    }
  }
}

module.exports = getPackageType;
module.exports.sync = getPackageTypeSync;
