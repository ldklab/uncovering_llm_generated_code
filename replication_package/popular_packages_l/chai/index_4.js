// Import Chai for assertions
const { expect } = require('chai');

// Function that adds two numbers
function add(num1, num2) {
  return num1 + num2;
}

// Test suite using Mocha
describe('Sample Addition Test', function() {

  // Test case to verify the add function
  it('should return the correct sum of two numbers', function() {
    const sum = add(2, 3);
    // Assert the result using Chai's expect
    expect(sum).to.equal(5);
  });
});
```