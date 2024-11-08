// simple-assertion.js

// Define an assert function that checks if a condition is true
function assert(condition, message) {
  // If the condition is false, throw an error with the provided message
  // If no message is provided, use "Assertion failed" as a default
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// Export the assert function for use in other modules
module.exports = assert;
