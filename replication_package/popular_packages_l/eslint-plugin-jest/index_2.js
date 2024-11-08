// eslint-plugin-jest/index.js
const { join } = require('path');

module.exports = {
  configs: {
    recommended: {
      plugins: ['jest'],
      env: {
        'jest/globals': true
      },
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error'
      }
    },
    style: {
      plugins: ['jest'],
      rules: {
        'jest/no-alias-methods': 'warn',
        'jest/no-commented-out-tests': 'warn',
        'jest/prefer-to-be': 'warn',
        'jest/prefer-to-contain': 'warn',
        'jest/prefer-to-have-length': 'warn'
      }
    },
    all: {
      plugins: ['jest'],
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
        // add all other rules with default warnings/errors
      }
    }
  },
  rules: [
    'no-disabled-tests', 
    'no-focused-tests', 
    'no-identical-title', 
    'prefer-to-have-length', 
    'valid-expect'
  ].reduce((acc, rule) => {
    acc[rule] = require(join(__dirname, 'rules', rule));
    return acc;
  }, {}),
  environments: {
    globals: {
      globals: {
        jest: {
          describe: true,
          it: true,
          test: true
        }
      }
    }
  }
};

// eslint-plugin-jest/rules/no-disabled-tests.js
module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        const disabledMethods = new Set(['xit', 'xdescribe']);
        if (disabledMethods.has(callee.name)) {
          context.report({
            node,
            message: 'Disabled tests are not allowed.'
          });
        }
      }
    };
  }
};

// Implement other rules (e.g., 'no-focused-tests', 'no-identical-title', etc.) similarly.
