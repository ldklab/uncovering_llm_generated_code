// File: exit.js
const exit = (exitCode = 0) => {
  const waitForDraining = () => {
    const stdoutDrained = process.stdout.write('');
    const stderrDrained = process.stderr.write('');

    if (!stdoutDrained || !stderrDrained) {
      setImmediate(waitForDraining);
    } else {
      process.exit(exitCode);
    }
  };

  waitForDraining();
};

module.exports = exit;

// Example Usage:
// const exit = require('./exit');
// console.log("omg");
// console.error("yay");
// exit(5);  // Ensures "omg" and "yay" are fully written before exiting
// console.log("wtf"); // These lines shouldn't appear
// console.error("bro");
