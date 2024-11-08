// File: exit.js
const exit = (exitCode = 0) => {
  // Ensure that stdout and stderr are fully drained before exiting.
  const drainAndExit = () => {
    if (!process.stdout.write('') || !process.stderr.write('')) {
      setImmediate(drainAndExit); // Schedule to check again if not fully drained
    } else {
      process.exit(exitCode); // Exit when streams are fully drained
    }
  };

  drainAndExit();
};

module.exports = exit;

// Example Usage:
// var exit = require('./exit');
// console.log("omg");
// console.error("yay");
// exit(5);  // Ensures "omg" and "yay" are fully written before exiting
// console.log("wtf"); // These lines shouldn't appear
// console.error("bro");
