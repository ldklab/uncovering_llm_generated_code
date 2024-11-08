// ShellJS - Unix shell commands for Node.js
// https://github.com/shelljs/shelljs

const common = require('./src/common');
const commands = require('./commands');

// Load default shell commands
commands.forEach(command => {
  require(`./src/${command}`);
});

// Exporting functionalities

// Process exit utility
exports.exit = process.exit;

// Error handling module
exports.error = require('./src/error');

// Shell string manipulation
exports.ShellString = common.ShellString;

// Access environment variables
exports.env = process.env;

// Configuration options
exports.config = common.config;

/*
Configuration Details:
- config.silent: Suppresses command output if true (default is false).
       Use:
       