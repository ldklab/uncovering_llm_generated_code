const common = require('./src/common');

// Load and initialize default ShellJS commands
require('./commands').forEach(command => {
  require(`./src/${command}`);
});

// Export process exit function to terminate the current script with a specified exit code
exports.exit = process.exit;

// Error handling export
exports.error = require('./src/error');

// ShellString utility function export
exports.ShellString = common.ShellString;

// Environment variables access via process.env
exports.env = process.env;

// Export configuration object with various settings
exports.config = {
  ...common.config,
  silent: false, // Suppress command outputs if true
  fatal: false,  // Throw error on command failure if true
  verbose: false // Print commands to console if true
};

// Export documentation and examples for configuration settings and piping commands
// including config.globOptions and config.reset()
