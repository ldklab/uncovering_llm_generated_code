markdown
// File: package.json
{
  "name": "eslint-plugin-import-sample",
  "version": "1.0.0",
  "main": "index.js",
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-plugin-import": "^2.30.0"
  },
  "scripts": {
    "lint": "eslint ."
  }
}

// File: .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:import/recommended'
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.mjs', '.json']
      }
    }
  },
  rules: {
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error'
  }
};

// File: index.js
import { example } from './example.js';

// File: example.js
export const example = () => {
  console.log("Example function");
};

// File: README.md
# Sample ESLint Plugin Import Project

This is a sample implementation using `eslint-plugin-import` to enforce import/export rules and ensure proper module resolution in a project.

## Setup

1. Install dependencies:
