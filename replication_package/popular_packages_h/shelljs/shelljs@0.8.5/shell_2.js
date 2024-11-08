// ShellJS: Unix shell commands on top of Node's API.

const common = require('./src/common');
const commands = require('./commands');

// Expose functionality for each default command
commands.forEach(command => {
  require(`./src/${command}`);
});

// Export core functions and properties
exports.exit = process.exit;
exports.error = require('./src/error');
exports.ShellString = common.ShellString;
exports.env = process.env;
exports.config = common.config;

// Documentation: These exports facilitate interaction with Unix-like shell commands in Node.js,
// providing flexibility and shell scripting capabilities.
