json
// package.json
{
  "name": "babel-jest-example",
  "version": "1.0.0",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "@babel/core": "^7.0.0",
    "babel-jest": "^27.0.0",
    "jest": "^27.0.0",
    "@babel/preset-env": "^7.0.0"
  },
  "jest": {
    "transform": {
      "\\.[jt]sx?$": "babel-jest"
    }
  },
  "babel": {
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "node": "current"
          }
        }
      ]
    ]
  }
}

// Example test file: sum.test.js
const sum = (a, b) => a + b;

describe('Math Operations', () => {
  test('add two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});

// Run `yarn test` to execute tests
