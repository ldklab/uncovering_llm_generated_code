// This Node.js code is for setting up ESLint with the jsx-a11y plugin to enhance accessibility in JSX code by ensuring compliance with the WAI-ARIA guidelines. It has two setups: a config file in JSON format and another in the modern flat configuration style via a JavaScript module.

// .eslintrc.json - Basic ESLint configuration using the jsx-a11y plugin
{
  "extends": [
    "eslint:recommended", // Include ESLint's recommended rules
    "plugin:jsx-a11y/recommended" // Include jsx-a11y's recommended rules
  ],
  "plugins": [
    "jsx-a11y" // Declare the jsx-a11y plugin
  ],
  "rules": {
    "jsx-a11y/alt-text": "error" // Specify that not providing alt text should be treated as an error
    // Additional custom rules can be customized here
  },
  "settings": {
    "jsx-a11y": {
      "polymorphicPropName": "as",
      "components": {
        "CustomButton": "button", // Map CustomButton component to a button element
        "MyLink": "a" // Map MyLink component to an anchor element
      },
      "attributes": {
        "for": ["htmlFor", "for"] // Allow "for" and "htmlFor" attributes
      }
    }
  }
}

// eslint.config.js - Using ESLint's flat configuration style
const jsxA11y = require('eslint-plugin-jsx-a11y');

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'], // Apply this configuration to .js, .jsx, .ts, and .tsx files
    plugins: {
      'jsx-a11y': jsxA11y // Register the jsx-a11y plugin
    },
    rules: {
      'jsx-a11y/alt-text': 'error' // Ensure alt text is provided for elements that require it
      // Other rules can be configured or extended here
    },
    settings: {
      'jsx-a11y': {
        polymorphicPropName: 'as'
        // Additional settings for jsx-a11y can be configured here
      }
    }
  }
];
