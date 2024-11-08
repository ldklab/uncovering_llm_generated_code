const fs = require('fs');
const path = require('path');

async function getPackageType(filePath) {
  const dirPath = path.dirname(filePath);
  const packageJsonPath = path.join(dirPath, 'package.json');

  try {
    const data = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);
    return packageJson.type || 'commonjs';
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      // If package.json does not exist or not a directory, return 'commonjs'
      return 'commonjs';
    } else {
      throw err;
    }
  }
}

function getPackageTypeSync(filePath) {
  const dirPath = path.dirname(filePath);
  const packageJsonPath = path.join(dirPath, 'package.json');

  try {
    const data = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);
    return packageJson.type || 'commonjs';
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      // If package.json does not exist or not a directory, return 'commonjs'
      return 'commonjs';
    } else {
      throw err;
    }
  }
}

module.exports = getPackageType;
module.exports.sync = getPackageTypeSync;
```
```