json
// Installation Instructions:
// To set up Jest as a testing tool, run:
// npm install --save-dev jest

// package.json configuration for a Node.js project using Jest
{
  "name": "my-jest-setup",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "jest"  // Script to run tests using Jest
  },
  "devDependencies": {
    "jest": "^29.0.0"  // Installing Jest as a development dependency
  }
}

// sum.js - Simple module with a sum function for demonstration purposes
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js - Test suite for the sum function
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

// Jest's Interactive Mode for re-running tests upon file changes:
// Invoke it using the command:
// npx jest --watch

// ExampleComponent.js - A minimal React component demonstration
import React from 'react';

function ExampleComponent() {
  return (
    <div>
      <h1>Hello, Jest!</h1>
    </div>
  );
}

export default ExampleComponent;

// ExampleComponent.test.js - Snapshot testing for ExampleComponent using React Test Renderer
import React from 'react';
import renderer from 'react-test-renderer';
import ExampleComponent from './ExampleComponent';

test('ExampleComponent renders correctly', () => {
  const tree = renderer.create(<ExampleComponent />).toJSON(); // Generate snapshot
  expect(tree).toMatchSnapshot(); // Compare output with stored snapshot
});

// To update the Jest snapshot when necessary, run:
// npx jest --updateSnapshot

// To execute your tests and validate code functionality, run:
// npm test
