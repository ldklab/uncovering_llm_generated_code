// ShellJS-like Library in Node.js

const common = require('./src/common');

// Load all default command modules
const commands = require('./commands');
commands.forEach(command => {
  require('./src/' + command);
});

// Exiting the process with a specific exit code
exports.exit = process.exit;

// Custom error module handling
exports.error = require('./src/error');

// Utility for handling shell strings
exports.ShellString = common.ShellString;

// Access to environment variables
exports.env = process.env;

// Configuration object for ShellJS
exports.config = common.config;

/* Configuration properties with examples:

1. config.silent:
   - Suppresses most command outputs (except for `echo()`) when true.
   - Usage example:
     