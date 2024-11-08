'use strict';

const fromEntries = require('object.fromentries');
const entries = require('object.entries');

const allRules = {
  'boolean-prop-naming': require('./lib/rules/boolean-prop-naming'),
  'button-has-type': require('./lib/rules/button-has-type'),
  'default-props-match-prop-types': require('./lib/rules/default-props-match-prop-types'),
  // ... other rules are similarly imported ...
  'void-dom-elements-no-children': require('./lib/rules/void-dom-elements-no-children')
};

function filterRules(rules, predicate) {
  return fromEntries(entries(rules).filter(([key, rule]) => predicate(rule)));
}

function configureAsError(rules) {
  return fromEntries(Object.keys(rules).map((key) => [`react/${key}`, 2]));
}

const activeRules = filterRules(allRules, (rule) => !rule.meta.deprecated);
const activeRulesConfig = configureAsError(activeRules);

const deprecatedRules = filterRules(allRules, (rule) => rule.meta.deprecated);

module.exports = {
  deprecatedRules,
  rules: allRules,
  configs: {
    recommended: {
      plugins: ['react'],
      parserOptions: { ecmaFeatures: { jsx: true } },
      rules: {
        'react/display-name': 2,
        'react/jsx-key': 2,
        'react/jsx-no-comment-textnodes': 2,
        'react/jsx-no-duplicate-props': 2,
        'react/jsx-no-target-blank': 2,
        'react/jsx-no-undef': 2,
        'react/jsx-uses-react': 2,
        'react/jsx-uses-vars': 2,
        'react/no-children-prop': 2,
        'react/no-danger-with-children': 2,
        'react/no-deprecated': 2,
        'react/no-direct-mutation-state': 2,
        'react/no-find-dom-node': 2,
        'react/no-is-mounted': 2,
        'react/no-render-return-value': 2,
        'react/no-string-refs': 2,
        'react/no-unescaped-entities': 2,
        'react/no-unknown-property': 2,
        'react/no-unsafe': 0,
        'react/prop-types': 2,
        'react/react-in-jsx-scope': 2,
        'react/require-render-return': 2
      }
    },
    all: {
      plugins: ['react'],
      parserOptions: { ecmaFeatures: { jsx: true } },
      rules: activeRulesConfig
    }
  }
};
