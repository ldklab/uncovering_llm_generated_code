// ShellJS module for Unix-like shell commands in Node.js environment

const common = require('./src/common');
const commands = require('./commands');

// Load and initialize all default shell commands
commands.forEach(command => require('./src/' + command));

// Export common shell features and configurations
module.exports = {
  exit: process.exit, // Exit process with specified code

  error: require('./src/error'), // Error handling included

  ShellString: common.ShellString, // Utility for shell string processing

  // Environment variable access (getter/setter)
  env: process.env,

  // Configuration options
  config: {
    ...common.config,

    // Function to reset configuration to default values
    reset() {
      this.fatal = false;
      this.globOptions = {};
      this.maxdepth = 255;
      this.noglob = false;
      this.silent = false;
      this.verbose = false;
    }
  }
};
