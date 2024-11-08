// Check if the current module is the entry point of the application
if (require.main === module) {
  // Execute the command-line interface code by passing the process object
  const cli = require('./lib/cli.js');
  cli(process);
} else {
  // Throw an error if this module is not used as the main module
  throw new Error('The programmatic API was removed in npm v8.0.0');
}
