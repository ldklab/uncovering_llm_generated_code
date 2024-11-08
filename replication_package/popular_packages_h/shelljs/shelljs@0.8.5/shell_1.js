// ShellJS setup for executing Unix shell commands in Node.js environment

const common = require('./src/common');

// Synchronously execute all default shell commands

const loadCommands = require('./commands');
loadCommands.forEach(command => require(`./src/${command}`));

// Export core functionalities

// Exit process with given exit code
exports.exit = process.exit;

// Error handling
exports.error = require('./src/error');

// ShellString utility
exports.ShellString = common.ShellString;

// Access environment variables (getter and setter)
exports.env = process.env;

// Configuration settings for ShellJS
exports.config = common.config;

// Example configurations:
// `config.silent` - suppress command output if true, default is false
// `config.fatal` - throw error on command failures if true, default is false
// `config.verbose` - prints each command when set to true
// `config.globOptions` - options for globbing patterns in shell commands
// `config.reset()` - restores default configuration

