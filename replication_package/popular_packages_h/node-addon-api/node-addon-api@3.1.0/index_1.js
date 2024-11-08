const path = require('path');

// Calculate the relative path to the current module directory from the current working directory
const includeDir = path.relative(process.cwd(), __dirname);

// Export the module configuration
module.exports = {
  // Deprecated property, marked for removal in version 4.0.0
  include: `"${__dirname}"`,
  
  // Relative directory path
  include_dir: includeDir,
  
  // GYP configuration path used for building native modules
  gyp: path.join(includeDir, 'node_api.gyp:nothing'),
  
  // Indicates the use of built-in Node.js API features
  isNodeApiBuiltin: true,
  
  // Specifies whether a particular flag is needed
  needsFlag: false
};
