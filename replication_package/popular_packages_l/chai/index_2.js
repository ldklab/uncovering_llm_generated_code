// Importing necessary modules
const { expect } = require('chai');

// A sample function to perform addition
function add(num1, num2) {
  return num1 + num2;
}

// Define a Mocha test suite
describe('Sample Addition Test', function() {
  
  // Define a test case within the suite to check the addition function
  it('should return the correct sum of two numbers', function() {
    const sum = add(2, 3);
    // Use Chai's expect assertion to ensure the function returns the correct result
    expect(sum).to.equal(5);
  });
});
```