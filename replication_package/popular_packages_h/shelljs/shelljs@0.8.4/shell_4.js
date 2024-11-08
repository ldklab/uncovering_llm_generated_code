// Import the common functionality module
const common = require('./src/common');

// Import and load all default shell commands
require('./commands').forEach(command => {
  require(`./src/${command}`);
});

// Export functions and configurations

// Exit the current process with a given code
exports.exit = process.exit;

// Error handling module export
exports.error = require('./src/error');

// ShellString function export from common module
exports.ShellString = common.ShellString;

// Environment variables access
exports.env = process.env;

// Configuration options export
exports.config = common.config;

/* 
Configuration options include:

- config.silent: Suppress command output except for echo() when true
- config.fatal: Throw error on command failure when true
- config.verbose: Print each command when true
- config.globOptions: Options for glob.sync() calls
- config.reset(): Resets the configuration to defaults
*/

