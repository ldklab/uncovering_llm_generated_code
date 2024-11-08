// Importing Chai's expect function
const { expect } = require('chai');

// A function that returns the sum of two numbers
function add(num1, num2) {
  return num1 + num2;
}

// Define a Mocha test suite
describe('Sample Addition Test', function() {

  // Define a test case within the suite
  it('should return the correct sum of two numbers', function() {
    const sum = add(2, 3);
    // Assert that the sum is equal to the expected result
    expect(sum).to.equal(5);
  });
});

// Instructions to run tests using Mocha:
// Execute the following command in your terminal:
// mocha test.js

// Instructions to use Chai plugins:

// Install a Chai plugin with:
// npm install --save-dev chai-plugin-name

// Then include it in your test file:

// const chai = require('chai');
// const chaiPluginName = require('chai-plugin-name');

// Extend Chai with the plugin
// chai.use(chaiPluginName);

// Use the expect style from Chai
// const { expect } = chai;

// Place your tests here...
```
