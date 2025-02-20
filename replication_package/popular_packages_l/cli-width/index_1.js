// The cliWidth function is designed to determine the width of the CLI console.

function cliWidth(options = {}) {
  // Extract options and define defaults
  const defaultWidth = options.defaultWidth || 0;
  const output = options.output || process.stdout;
  const tty = options.tty || require('tty');

  // 1. Fetch width from the environment variable "CLI_WIDTH"
  if (process.env.CLI_WIDTH) {
    const widthFromEnv = parseInt(process.env.CLI_WIDTH, 10);
    if (!isNaN(widthFromEnv)) {
      return widthFromEnv; // Return if a valid number is found
    }
  }

  // 2. Retrieve width from the output stream's columns property
  if (output && typeof output.columns === 'number') {
    return output.columns;
  }

  // 3. Utilize the tty module to get terminal window size if applicable
  if (tty.isatty(output.fd)) {
    try {
      return tty.getWindowSize(output.fd)[1];
    } catch (e) {
      // If fetching width from TTY fails, ignore the error
    }
  }

  // 4. If all above methods fail, return the specified or default width
  return defaultWidth;
}

// Export the function for use in other modules
module.exports = cliWidth;

// If this file is run directly
if (require.main === module) {
  const width = cliWidth(); // Determine CLI width
  console.log(`The CLI width is: ${width}`); // Output the determined width
}

// Testing functionality to ensure cliWidth behaves as expected
const assert = require('assert');

function testCliWidth() {
  // Store existing CLI_WIDTH value and mock a new one
  const originalEnvWidth = process.env.CLI_WIDTH;
  process.env.CLI_WIDTH = '123';
  assert.strictEqual(cliWidth(), 123, 'Should return width from environment variable'); // Validate functionality

  // Restore any original environment values to avoid side effects
  process.env.CLI_WIDTH = originalEnvWidth;

  console.log('All tests passed!'); // Confirm tests passed
}

// Run tests if this file is run directly
if (require.main === module) {
  testCliWidth();
}
