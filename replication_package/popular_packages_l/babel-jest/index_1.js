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
    "@babel/preset-env": "^7.0.0",
    "babel-jest": "^26.6.0",
    "jest": "^26.6.0"
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

// sum.test.js
function sum(a, b) {
  return a + b;
}

test('sums two numbers', () => {
  expect(sum(1, 2)).toBe(3);
});
