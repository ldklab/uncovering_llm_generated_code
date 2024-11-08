// eslint-plugin-jest/index.js
const noDisabledTests = require('./rules/no-disabled-tests');
const noFocusedTests = require('./rules/no-focused-tests');
const noIdenticalTitle = require('./rules/no-identical-title');
const preferToHaveLength = require('./rules/prefer-to-have-length');
const validExpect = require('./rules/valid-expect');

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
        'jest/valid-expect': 'error'
      }
    }
  },
  rules: {
    'no-disabled-tests': noDisabledTests,
    'no-focused-tests': noFocusedTests,
    'no-identical-title': noIdenticalTitle,
    'prefer-to-have-length': preferToHaveLength,
    'valid-expect': validExpect
  },
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
        const functionNames = ['xit', 'xdescribe'];
        if (functionNames.includes(node.callee.name)) {
          context.report({
            node,
            message: 'Disabled tests are not allowed.'
          });
        }
      }
    };
  }
};

// Add similar rule exports for 'no-focused-tests', 'no-identical-title',
// 'prefer-to-have-length', 'valid-expect' following the structure in 'no-disabled-tests.js'.
