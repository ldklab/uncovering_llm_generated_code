const path = require('path');
const { version } = require('./package.json');

const includeDir = path.relative('.', __dirname);

const config = {
  include: `"${__dirname}"`, // deprecated, can be removed as part of 4.0.0
  include_dir: includeDir,
  gyp: path.join(includeDir, 'node_api.gyp:nothing'), // deprecated.
  targets: path.join(includeDir, 'node_addon_api.gyp'),
  version,
  isNodeApiBuiltin: true,
  needsFlag: false
};

module.exports = config;
