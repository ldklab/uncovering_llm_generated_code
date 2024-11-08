// File: exit.js
function ensureDrainedAndExit(exitCode = 0) {
  const checkDrainState = () => {
    const stdoutDrained = process.stdout.write('');
    const stderrDrained = process.stderr.write('');

    if (!stdoutDrained || !stderrDrained) {
      setImmediate(checkDrainState);
    } else {
      process.exit(exitCode);
    }
  };

  checkDrainState();
}

module.exports = ensureDrainedAndExit;

// Example Usage:
// const ensureDrainedAndExit = require('./exit');
// console.log("omg");
// console.error("yay");
// ensureDrainedAndExit(5);  // Ensures "omg" and "yay" are fully written before exiting
// console.log("wtf"); // These lines shouldn't appear
// console.error("bro");
