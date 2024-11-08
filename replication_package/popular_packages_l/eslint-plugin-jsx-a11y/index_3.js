json
// Install ESLint and eslint-plugin-jsx-a11y
// npm install eslint eslint-plugin-jsx-a11y --save-dev

// .eslintrc.json - A basic configuration file for ESLint using the plugin
{
  "extends": [
    "eslint:recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": [
    "jsx-a11y"
  ],
  "rules": {
    "jsx-a11y/alt-text": "error"
  },
  "settings": {
    "jsx-a11y": {
      "polymorphicPropName": "as",
      "components": {
        "CustomButton": "button",
        "MyLink": "a"
      },
      "attributes": {
        "for": ["htmlFor", "for"]
      }
    }
  }
}

// eslint.config.js - Using flat config style (if using modern ESLint setup)
const jsxA11y = require('eslint-plugin-jsx-a11y');

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      'jsx-a11y/alt-text': 'error'
    },
    settings: {
      'jsx-a11y': {
        polymorphicPropName: 'as'
      }
    }
  }
];
