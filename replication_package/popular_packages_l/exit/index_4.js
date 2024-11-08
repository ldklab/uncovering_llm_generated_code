// File: exit.js
const exit = (exitCode = 0) => {
  const drainAndExit = () => {
    if (!process.stdout.write('') || !process.stderr.write('')) {
      setImmediate(drainAndExit);
    } else {
      process.exit(exitCode);
    }
  };

  drainAndExit();
};

module.exports = exit;

// Example Usage:
// const exit = require('./exit');
// console.log("omg");
// console.error("yay");
// exit(5);
// console.log("wtf");
// console.error("bro");
