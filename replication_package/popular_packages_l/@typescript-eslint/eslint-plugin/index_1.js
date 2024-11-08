// index.js
module.exports = {
  rules: {
    'adjacent-overload-signatures': require('./rules/adjacent-overload-signatures'),
    'array-type': require('./rules/array-type'),
    // Additional rules can be referenced here
  },
  configs: {
    recommended: {
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      // Setting recommended rules for TypeScript
      rules: {
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': ['error', { default: 'array' }],
        // Other recommended rules go here...
      },
    },
    'recommended-requiring-type-checking': {
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      // Rules needing type information
      rules: {
        '@typescript-eslint/no-floating-promises': 'error',
        // Additional type-checking rules...
      },
    },
  },
};

// rules/adjacent-overload-signatures.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require that member overloads be consecutive',
      recommended: true,
    },
    schema: [], 
    messages: {
      adjacentOverload: 'All overloads for a member must be consecutive.',
    },
  },
  create(context) {
    return {
      TSEnumDeclaration(node) {
        // Logic for reporting non-consecutive overloads
      },
    };
  },
};

// rules/array-type.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Requires using either T[] or Array<T> for arrays',
      recommended: false,
      fixable: 'code',
    },
    schema: [
      {
        enum: ['array', 'generic'],
      },
    ],
  },
  create(context) {
    return {
      TSTypeReference(node) {
        // Logic for enforcing array type style
      },
    };
  },
};

// .eslintrc.js template
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
  },
};
