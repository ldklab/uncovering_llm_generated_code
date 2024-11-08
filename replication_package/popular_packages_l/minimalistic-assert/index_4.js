// assertFunction.js

function simpleAssert(isTrue, errorMsg) {
  if (!isTrue) {
    throw new Error(errorMsg || "Assertion failed");
  }
}

module.exports = simpleAssert;
