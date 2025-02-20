// get-caller-file.js
module.exports = function getCallerFile(position = 2) {
  // Validate the position parameter to ensure it's a non-negative number.
  if (isNaN(position) || position < 0) {
    throw new TypeError("Position must be a non-negative number");
  }

  // Save the original Error.prepareStackTrace function.
  const oldPrepareStackTrace = Error.prepareStackTrace;
  try {
    // Create a new Error to capture the stack trace.
    const err = new Error();
    
    // Override prepareStackTrace to return the stack as is.
    Error.prepareStackTrace = (err, stack) => stack;
    
    // Retrieve the stack trace from the error.
    const stack = err.stack;

    // If the stack trace exists and has the requested position, return the file name at that position.
    if (stack && stack.length > position) {
      return stack[position].getFileName();
    }
  } catch (err) {
    // Any additional error handling can be done here if needed.
  } finally {
    // Restore the original prepareStackTrace function.
    Error.prepareStackTrace = oldPrepareStackTrace;
  }
  
  // Return undefined if the caller file could not be determined.
  return undefined;
};

// foo.js
const getCallerFile = require('./get-caller-file');

// Export a function that uses getCallerFile to determine and return the file that called this function.
module.exports = function() {
  return getCallerFile(); // Uses the default position to get immediate caller file.
};

// index.js
const foo = require('./foo');

// Invoke the function and log the result, which should be the file path of the 'index.js' file, the immediate caller.
console.log(foo());
