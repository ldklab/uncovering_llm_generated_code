const path = require('path');

const includeDirRelativePath = path.relative('.', __dirname);

module.exports = {
  // Deprecated: Can be removed as part of the 4.0.0 update
  include: `"${__dirname}"`, 
  include_dir: includeDirRelativePath,
  gypFilePath: path.join(includeDirRelativePath, 'node_api.gyp:nothing'),
  isNodeApiBuiltin: true,
  needsFlag: false
};
