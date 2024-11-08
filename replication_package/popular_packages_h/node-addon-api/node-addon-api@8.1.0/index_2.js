const path = require('path');
const { version } = require('./package.json');

// Calculate the directory path relative to the current working directory
const includeDir = path.relative('.', __dirname);

// Export configuration settings
module.exports = {
  // Deprecated, can be removed in future versions
  include: path.resolve(__dirname), 
  // Directory path relative to the current working directory
  include_dir: includeDir,
  // Another deprecated property
  gyp: path.join(includeDir, 'node_api.gyp:nothing'),
  // Path to the target gyp file
  targets: path.join(includeDir, 'node_addon_api.gyp'),
  // Version from package.json
  version,
  // Indicates if Node-API is built-in
  isNodeApiBuiltin: true,
  // Boolean flag that is set to false
  needsFlag: false
};
