const fs = require('fs');
const path = require('path');

async function getPackageType(filePath) {
  const packageJsonPath = path.join(path.dirname(filePath), 'package.json');

  try {
    const data = await fs.promises.readFile(packageJsonPath, 'utf8');
    const { type } = JSON.parse(data);
    return type || 'commonjs';
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return 'commonjs';
    }
    throw err;
  }
}

function getPackageTypeSync(filePath) {
  const packageJsonPath = path.join(path.dirname(filePath), 'package.json');

  try {
    const data = fs.readFileSync(packageJsonPath, 'utf8');
    const { type } = JSON.parse(data);
    return type || 'commonjs';
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return 'commonjs';
    }
    throw err;
  }
}

module.exports = getPackageType;
module.exports.sync = getPackageTypeSync;
