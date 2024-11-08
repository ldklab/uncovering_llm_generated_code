// simple-assert.js

function simpleAssert(condition, errorMessage = "Assertion failed") {
  if (!condition) {
    throw new Error(errorMessage);
  }
}

module.exports = simpleAssert;
