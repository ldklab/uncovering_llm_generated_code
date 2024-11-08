const path = require('path');
const { version } = require('./package.json');

const includeDir = path.relative('.', __dirname);

module.exports = {
  include_dir: includeDir,
  targets: path.join(includeDir, 'node_addon_api.gyp'),
  version,
  isNodeApiBuiltin: true,
  needsFlag: false
};
