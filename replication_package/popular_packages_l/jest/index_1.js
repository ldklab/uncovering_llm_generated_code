// Installation Instructions
// Run the following command to install Jest as a development dependency
// npm install --save-dev jest

// package.json configuration for setting up Jest
{
  "name": "my-jest-setup",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "jest"  // Sets 'jest' as the test runner
  },
  "devDependencies": {
    "jest": "^29.0.0"  // Specifies Jest as a development dependency
  }
}

// sum.js - A module providing a sum function
function sum(a, b) {
  return a + b;  // Returns the sum of two numbers
}
module.exports = sum;

// sum.test.js - Jest test for the sum function
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);  // Test case to verify sum function
});

// Instructions for using Jest's interactive mode
// Run Jest in watch mode for continuous testing during development:
// npx jest --watch

// Example of component and snapshot testing with React
// Ensure React and React Test Renderer are installed for snapshot testing

// ExampleComponent.js - Simple React component
import React from 'react';

function ExampleComponent() {
  return (
    <div>
      <h1>Hello, Jest!</h1>
    </div>
  );
}

export default ExampleComponent;

// ExampleComponent.test.js - Snapshot test for ExampleComponent
import React from 'react';
import renderer from 'react-test-renderer';
import ExampleComponent from './ExampleComponent';

test('ExampleComponent renders correctly', () => {
  const tree = renderer.create(<ExampleComponent />).toJSON();
  expect(tree).toMatchSnapshot();  // Snapshot comparison to ensure consistent UI
});

// Instructions for updating Jest snapshots
// Update snapshots when component changes are made and verified:
// npx jest --updateSnapshot

// Running all tests in the suite
// Execute the following to run Jest tests and receive feedback:
// npm test
