const path = require('path');

const include_dir = path.relative(process.cwd(), __dirname);

module.exports = {
  // This property is deprecated and might be removed in future versions
  // include: `"${__dirname}"`,
  include_dir,
  gyp: path.join(include_dir, 'node_api.gyp:nothing'),
  isNodeApiBuiltin: true,
  needsFlag: false
};
