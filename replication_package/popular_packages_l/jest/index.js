// Installation Instructions
// Run the following command to install Jest as a development dependency
// npm install --save-dev jest

// package.json
{
  "name": "my-jest-setup",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0"  // Ensure you have the latest version
  }
}

// Basic test example

// sum.js - a simple module to demonstrate testing
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js - tests for the sum module
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

// Interactive Mode and Snapshot Testing

// To enter Jest's interactive mode, run this in your terminal:
// npx jest --watch

// Component and Snapshot testing example (requires React and React Test Renderer)

// ExampleComponent.js - a simple React component
import React from 'react';

function ExampleComponent() {
  return (
    <div>
      <h1>Hello, Jest!</h1>
    </div>
  );
}

export default ExampleComponent;

// ExampleComponent.test.js - snapshot test for ExampleComponent
import React from 'react';
import renderer from 'react-test-renderer';
import ExampleComponent from './ExampleComponent';

test('ExampleComponent renders correctly', () => {
  const tree = renderer.create(<ExampleComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});

// To update a snapshot, execute:
// npx jest --updateSnapshot

// Running tests
// Execute `npm test` to run your Jest tests and produce feedback on your code's correctness.
