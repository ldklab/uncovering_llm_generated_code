// eslint-plugin-jest/index.js
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
        // Include any other comprehensive rules as needed
      }
    }
  },
  rules: {
    'no-disabled-tests': require('./rules/no-disabled-tests'),
    'no-focused-tests': require('./rules/no-focused-tests'),
    'no-identical-title': require('./rules/no-identical-title'),
    'prefer-to-have-length': require('./rules/prefer-to-have-length'),
    'valid-expect': require('./rules/valid-expect')
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
  create: function(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        if (callee.name === 'xit' || callee.name === 'xdescribe') {
          context.report({
            node,
            message: 'Disabled tests are not allowed.'
          });
        }
      }
    };
  }
};

// Similarly, other rules would be created in their respective files following the above pattern.
