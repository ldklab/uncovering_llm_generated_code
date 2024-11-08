// get-caller-file.js
module.exports = function getCallerFile(position = 2) {
  if (isNaN(position) || position < 0) {
    throw new TypeError("Position must be a non-negative number");
  }

  const originalPrepareStackTrace = Error.prepareStackTrace;
  try {
    const error = new Error();
    Error.prepareStackTrace = (error, structuredStackTrace) => structuredStackTrace;
    const stack = error.stack;

    if (stack && stack.length > position) {
      return stack[position].getFileName();
    }
  } catch (error) {
    // Handle possible stack trace retrieval errors
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace;
  }

  return undefined;
};

// foo.js
const getCallerFile = require('./get-caller-file');

module.exports = function() {
  return getCallerFile(); // Identifies the caller's file path
};

// index.js
const foo = require('./foo');

console.log(foo()); // Outputs the file path of 'index.js'
