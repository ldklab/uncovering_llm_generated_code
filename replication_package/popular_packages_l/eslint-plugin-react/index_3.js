json
// package.json
{
  "name": "eslint-plugin-react",
  "version": "1.0.0",
  "description": "React specific linting rules for ESLint",
  "main": "index.js",
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-plugin-react": "^1.0.0"
  }
}

// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "plugins": [
    "react"
  ],
  "settings": {
    "react": {
      "createClass": "createReactClass",
      "pragma": "React",
      "fragment": "Fragment",
      "version": "detect"
    }
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error"
  }
}

// eslint.config.js
const reactPlugin = require('eslint-plugin-react');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    plugins: {
      react: reactPlugin
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error'
    }
  }
];
