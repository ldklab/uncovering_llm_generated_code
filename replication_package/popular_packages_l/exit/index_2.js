// File: gracefulExit.js
const gracefulExit = (exitCode = 0) => {
  // Function to check and wait until stdout and stderr are drained
  const checkAndExit = () => {
    if (!process.stdout.write('') || !process.stderr.write('')) {
      // If write buffers are busy, retry the check in the next event loop cycle
      setImmediate(checkAndExit); 
    } else {
      // Exit the process once both streams are drained
      process.exit(exitCode);
    }
  };

  checkAndExit();
};

module.exports = gracefulExit;

// Example Usage:
// const gracefulExit = require('./gracefulExit');
// console.log("Example output.");
// console.error("Example error.");
// gracefulExit(5);  // Ensures "Example output." and "Example error." are flushed before exit
// console.log("This will not be shown.");
// console.error("Nor will this.");
