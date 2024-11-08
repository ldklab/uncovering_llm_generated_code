// This function calculates the width of a command-line interface (CLI) terminal.
// It determines the width using several methods, prioritizing environment variables, output properties, and system modules.

function cliWidth(options = {}) {
  const defaultWidth = options.defaultWidth || 0; // Fallback width if others fail
  const output = options.output || process.stdout; // Defaults to standard output
  const tty = options.tty || require('tty'); // Terminal utility module

  // 1. Check if the CLI width is set using an environment variable
  if (process.env.CLI_WIDTH) {
    const widthFromEnv = parseInt(process.env.CLI_WIDTH, 10); // Convert to integer
    if (!isNaN(widthFromEnv)) { // Validate that it's a number
      return widthFromEnv; // Return if valid
    }
  }

  // 2. Attempt to retrieve width from the output stream's `columns` property
  if (output && typeof output.columns === 'number') {
    return output.columns; // Return if defined
  }

  // 3. Use the `tty` module to determine the terminal size if `isatty` returns true for the file descriptor
  if (tty.isatty(output.fd)) {
    try {
      return tty.getWindowSize(output.fd)[1]; // Get terminal width
    } catch (e) {
      // Error handling if getting terminal size fails
    }
  }

  // 4. Default to the specified default width
  return defaultWidth;
}

module.exports = cliWidth;

// Usage example: Print the CLI width when this script is run directly
if (require.main === module) {
  const width = cliWidth(); // Get CLI width
  console.log(`The CLI width is: ${width}`); // Display it
}

// Test function to check if `cliWidth` behaves as expected
const assert = require('assert');

function testCliWidth() {
  const originalEnvWidth = process.env.CLI_WIDTH; // Save the original environment variable
  process.env.CLI_WIDTH = '123'; // Mock environment variable
  assert.strictEqual(cliWidth(), 123, 'Should return width from environment variable'); // Verify

  // Restore the original environment variable
  process.env.CLI_WIDTH = originalEnvWidth;

  console.log('All tests passed!'); // Confirm all tests passed
}

if (require.main === module) {
  testCliWidth(); // Run the test if script is executed directly
}
