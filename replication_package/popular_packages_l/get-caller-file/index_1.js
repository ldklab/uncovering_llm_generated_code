// get-caller-file.js
module.exports = function getCallerFile(position = 2) {
  if (isNaN(position) || position < 0) {
    throw new TypeError("Position must be a non-negative number");
  }

  const oldPrepareStackTrace = Error.prepareStackTrace;
  try {
    const err = new Error();
    Error.prepareStackTrace = (err, stack) => stack;
    const stack = err.stack;

    if (stack && stack.length > position) {
      return stack[position].getFileName();
    }
  } catch (err) {
    // Handle possible errors reading the stack
  } finally {
    Error.prepareStackTrace = oldPrepareStackTrace;
  }
  
  return undefined;
};

// foo.js
const getCallerFile = require('./get-caller-file');

module.exports = function() {
  return getCallerFile(); // Figures out who called this function
};

// index.js
const foo = require('./foo');

console.log(foo()); // Prints the full path of 'index.js'
