'use strict';

const fromEntries = require('object.fromentries');
const entries = require('object.entries');

// Importing React linting rules from respective files
const allRules = {
  'boolean-prop-naming': require('./lib/rules/boolean-prop-naming'),
  'button-has-type': require('./lib/rules/button-has-type'),
  // Omitted rest of the rules for brevity
  'void-dom-elements-no-children': require('./lib/rules/void-dom-elements-no-children')
};

// Function to filter rules based on a condition
function filterRules(rules, predicate) {
  return fromEntries(entries(rules).filter((entry) => predicate(entry[1])));
}

// Function to configure rules as errors
function configureAsError(rules) {
  return fromEntries(Object.keys(rules).map((key) => [`react/${key}`, 2]));
}

// Filter non-deprecated and deprecated rules
const activeRules = filterRules(allRules, (rule) => !rule.meta.deprecated);
const activeRulesConfig = configureAsError(activeRules);
const deprecatedRules = filterRules(allRules, (rule) => rule.meta.deprecated);

// Exporting the deprecated rules, all rules, and configurations
module.exports = {
  deprecatedRules,
  rules: allRules,
  configs: {
    recommended: {
      plugins: ['react'],
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      rules: {
        'react/display-name': 2,
        'react/jsx-key': 2,
        'react/jsx-no-comment-textnodes': 2,
        // Other recommended rules configurations
        'react/no-unsafe': 0,
        'react/prop-types': 2,
        // Final set of recommended rules
        'react/require-render-return': 2
      }
    },
    all: {
      plugins: ['react'],
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      rules: activeRulesConfig
    }
  }
};
