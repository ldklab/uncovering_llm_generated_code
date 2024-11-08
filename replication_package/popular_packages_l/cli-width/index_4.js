// cli-width implementation

function cliWidth(options = {}) {
  const defaultWidth = options.defaultWidth || 0;
  const output = options.output || process.stdout;
  const tty = options.tty || require('tty');

  // 1. Try to get width from environment variable
  if (process.env.CLI_WIDTH) {
    const widthFromEnv = parseInt(process.env.CLI_WIDTH, 10);
    if (!isNaN(widthFromEnv)) {
      return widthFromEnv;
    }
  }

  // 2. Try to get width from output stream
  if (output && typeof output.columns === 'number') {
    return output.columns;
  }

  // 3. Try to get width from tty module
  if (tty.isatty(output.fd)) {
    try {
      return tty.getWindowSize(output.fd)[1];
    } catch (e) {
      // failed to get width from TTY
    }
  }

  // 4. Return the default width
  return defaultWidth;
}

module.exports = cliWidth;

// Usage example
if (require.main === module) {
  const width = cliWidth();
  console.log(`The CLI width is: ${width}`);
}

// Testing functionality
const assert = require('assert');

function testCliWidth() {
  // Backup the original environment variable
  const originalEnvWidth = process.env.CLI_WIDTH;
  
  try {
    // Test with mock environment variable
    process.env.CLI_WIDTH = '123';
    assert.strictEqual(cliWidth(), 123, 'Should return width from environment variable');
  } finally {
    // Restore the original environment variable
    process.env.CLI_WIDTH = originalEnvWidth;
  }

  console.log('All tests passed!');
}

if (require.main === module) {
  testCliWidth();
}
