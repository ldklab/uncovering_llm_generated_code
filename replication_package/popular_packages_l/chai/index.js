// Importing Chai
const { expect } = require('chai');

// A sample function to test
function add(num1, num2) {
  return num1 + num2;
}

// Mocha test suite
describe('Sample Addition Test', function() {

  // Mocha test case
  it('should return the correct sum of two numbers', function() {
    const sum = add(2, 3);
    // Chai's expect assertion for checking the result
    expect(sum).to.equal(5);
  });
});
```

### Running Tests

To run your tests using Mocha, simply use the following command in your terminal:

```bash
mocha test.js
```

### Using Chai Plugins

If you need to extend Chai with additional capabilities, you can use plugins. Here's how to add a hypothetical plugin:

```bash
npm install --save-dev chai-plugin-name
```

Then, in your test file:



const chai = require('chai');
const chaiPluginName = require('chai-plugin-name');

// Use the plugin
chai.use(chaiPluginName);

// Use Chai's expect style
const { expect } = chai;

// Your tests here...
```

This setup provides a comprehensive guide to integrating Chai into a Node.js testing environment with Mocha, showing how to take advantage of its rich assertion styles.