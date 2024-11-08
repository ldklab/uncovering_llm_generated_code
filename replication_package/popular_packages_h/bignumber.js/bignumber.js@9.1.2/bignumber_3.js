(function (globalObject) {
  'use strict';

  // Basic setup for BigNumber constructor
  function BigNumber(value) {
    this.value = value; // Store the input value
  }

  // Add method for BigNumber prototype to add two BigNumbers
  BigNumber.prototype.plus = function (other) {
    let a = parseFloat(this.value);
    let b = parseFloat(other.value);
    let sum = a + b;
    return new BigNumber(sum.toString());
  };

  // Export the BigNumber class
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigNumber;
  } else {
    if (!globalObject) {
      globalObject = typeof self !== 'undefined' && self ? self : window;
    }
    globalObject.BigNumber = BigNumber;
  }
})(this);

// Example usage
let num1 = new BigNumber('10.25');
let num2 = new BigNumber('5.75');
let result = num1.plus(num2);
console.log(result.value); // Output: 16
