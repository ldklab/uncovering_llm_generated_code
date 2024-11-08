const fs = require('fs');
const path = require('path');

async function getPackageType(filePath) {
  try {
    const packageJsonPath = path.join(path.dirname(filePath), 'package.json');
    const data = await fs.promises.readFile(packageJsonPath, 'utf8');
    return JSON.parse(data).type || 'commonjs';
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return 'commonjs';
    }
    throw err;
  }
}

function getPackageTypeSync(filePath) {
  try {
    const packageJsonPath = path.join(path.dirname(filePath), 'package.json');
    const data = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(data).type || 'commonjs';
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return 'commonjs';
    }
    throw err;
  }
}

module.exports = getPackageType;
module.exports.sync = getPackageTypeSync;
