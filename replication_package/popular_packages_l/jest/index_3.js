// Installation Instructions
// Ensure you have Jest installed as a development dependency by running:
// npm install --save-dev jest

// package.json configuration
{
  "name": "my-jest-setup",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}

// A Simple Module for Demonstration: sum.js
// This module exports a function that sums two numbers.
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// Writing Tests for the sum.js Module: sum.test.js
// Import the sum function and write a test case to check its functionality.
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

// Interactive Testing and Snapshot Testing with Jest

// Use Jest's interactive mode to rerun tests automatically with:
// npx jest --watch

// React Component and Snapshot Testing Example

// Example React Component: ExampleComponent.js
// A basic React component that displays a message.
import React from 'react';

function ExampleComponent() {
  return (
    <div>
      <h1>Hello, Jest!</h1>
    </div>
  );
}

export default ExampleComponent;

// Snapshot Test for React Component: ExampleComponent.test.js
// Uses react-test-renderer to create and compare snapshots.
import React from 'react';
import renderer from 'react-test-renderer';
import ExampleComponent from './ExampleComponent';

test('ExampleComponent renders correctly', () => {
  const tree = renderer.create(<ExampleComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});

// To update snapshots, use:
// npx jest --updateSnapshot

// To execute all tests, run:
// npm test
