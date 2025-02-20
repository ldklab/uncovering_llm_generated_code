// Import the Chai assertion library
const chai = require('chai');
const { expect } = chai;

// A basic function to add two numbers
function add(num1, num2) {
  return num1 + num2;
}

// Define a test suite using Mocha
describe('Addition Functionality Test', function() {

  // Define an individual test case
  it('should correctly compute the sum of two numbers', function() {
    const result = add(2, 3);
    // Use Chai's expect assertion to verify the outcome
    expect(result).to.equal(5);
  });
});

```

### Running Tests

To execute your Mocha tests, run the following command in your terminal:

```bash
mocha test.js
```

### Using Chai Plugins

To extend Chai's capabilities with plugins, follow these steps:

Install the plugin via npm:

```bash
npm install --save-dev chai-plugin-name
```

Include and use the plugin in your test file:



const chai = require('chai');
const chaiPluginName = require('chai-plugin-name');

// Register the plugin with Chai
chai.use(chaiPluginName);

// Use Chai's expect syntax for assertions
const { expect } = chai;

// Place your tests here...
```

This setup illustrates how to effectively use Chai within a Node.js testing framework powered by Mocha, emphasizing the utility of its flexible assertion styles and how to augment them with plugins.