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
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace;
  }
  
  return undefined;
};

// foo.js
const getCallerFile = require('./get-caller-file');

module.exports = function() {
  return getCallerFile(); // Retrieves the path of the invoking file
};

// index.js
const foo = require('./foo');

console.log(foo()); // Outputs the full path of the file 'index.js'
