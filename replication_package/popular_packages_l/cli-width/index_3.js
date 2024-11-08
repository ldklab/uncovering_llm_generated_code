// Function to determine the width of the command-line interface (CLI) or terminal

function cliWidth(options = {}) {
  // Set default width and output stream using options or fallback to defaults
  const defaultWidth = options.defaultWidth || 0;
  const output = options.output || process.stdout;
  const tty = options.tty || require('tty');

  // Priority 1: Retrieve width from the environment variable 'CLI_WIDTH', if available
  if (process.env.CLI_WIDTH) {
    const widthFromEnv = parseInt(process.env.CLI_WIDTH, 10);
    if (!isNaN(widthFromEnv)) {
      return widthFromEnv;
    }
  }

  // Priority 2: Retrieve width from 'columns' property of the output stream, if available
  if (output && typeof output.columns === 'number') {
    return output.columns;
  }

  // Priority 3: Use 'tty' module to obtain the window size if the output stream is a TTY
  if (tty.isatty(output.fd)) {
    try {
      // Get window size, where the width is the second element
      return tty.getWindowSize(output.fd)[1];
    } catch (e) {
      // In case of failure, proceed to return default width
    }
  }

  // Priority 4: Return the default width as a fallback
  return defaultWidth;
}

module.exports = cliWidth;

// Example usage within a script
if (require.main === module) {
  const width = cliWidth();
  console.log(`The CLI width is: ${width}`);
}

// Simple test implementation for cliWidth function
const assert = require('assert');

function testCliWidth() {
  // Backup original CLI_WIDTH environment variable and set a mock value
  const originalEnvWidth = process.env.CLI_WIDTH;
  process.env.CLI_WIDTH = '123';
  // Assert that the cliWidth function returns the mocked environment width
  assert.strictEqual(cliWidth(), 123, 'Should return width from environment variable');
  
  // Restore original environment variable value
  process.env.CLI_WIDTH = originalEnvWidth;

  console.log('All tests passed!');
}

// The module runs test code when executed directly from the command line
if (require.main === module) {
  testCliWidth();
}
