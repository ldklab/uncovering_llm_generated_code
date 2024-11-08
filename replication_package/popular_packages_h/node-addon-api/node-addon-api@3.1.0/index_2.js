const path = require('path');

const includeDirectory = path.relative(process.cwd(), __dirname);

module.exports = {
  // This line is deprecated and should be removed in version 4.0.0
  include: `"${__dirname}"`,
  include_dir: includeDirectory,
  gyp: path.join(includeDirectory, 'node_api.gyp:nothing'),
  isNodeApiBuiltin: true,
  needsFlag: false
};
