"use strict";

const fs = require("fs");
const path = require("path");
const packageConfig = require("../package.json");
const globals = require("./globals.json");

// Function to handle default imports
const interopRequireDefault = (obj) => (obj && obj.__esModule ? obj : { default: obj });

// Function to import the default export from a module
const importDefault = (moduleName) =>
  interopRequireDefault(require(moduleName)).default;

// Directory containing rule modules
const rulesDir = path.join(__dirname, 'rules');

// Files to exclude when loading rule modules
const excludedFiles = ['__tests__', 'detectJestVersion', 'utils'];

// Load and initialize rules
const rules = Object.fromEntries(
  fs.readdirSync(rulesDir)
    .map(rule => path.parse(rule).name)
    .filter(rule => !excludedFiles.includes(rule))
    .map(rule => [rule, importDefault(path.join(rulesDir, rule))])
);

// Rule sets
const recommendedRules = {
  'jest/expect-expect': 'warn',
  'jest/no-alias-methods': 'error',
  'jest/no-commented-out-tests': 'warn',
  'jest/no-conditional-expect': 'error',
  'jest/no-deprecated-functions': 'error',
  'jest/no-disabled-tests': 'warn',
  'jest/no-done-callback': 'error',
  'jest/no-export': 'error',
  'jest/no-focused-tests': 'error',
  'jest/no-identical-title': 'error',
  'jest/no-interpolation-in-snapshots': 'error',
  'jest/no-jasmine-globals': 'error',
  'jest/no-mocks-import': 'error',
  'jest/no-standalone-expect': 'error',
  'jest/no-test-prefixes': 'error',
  'jest/valid-describe-callback': 'error',
  'jest/valid-expect': 'error',
  'jest/valid-expect-in-promise': 'error',
  'jest/valid-title': 'error'
};

const styleRules = {
  'jest/no-alias-methods': 'warn',
  'jest/prefer-to-be': 'error',
  'jest/prefer-to-contain': 'error',
  'jest/prefer-to-have-length': 'error'
};

const allRules = Object.fromEntries(
  Object.entries(rules)
    .filter(([, rule]) => !rule.meta.deprecated)
    .map(([name]) => [`jest/${name}`, 'error'])
);

// Plugin setup
const plugin = {
  meta: {
    name: packageConfig.name,
    version: packageConfig.version
  },
  configs: {},
  environments: {
    globals: {
      globals
    }
  },
  rules
};

// Configuration creators
const createRCConfig = (rules) => ({
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  rules
});

const createFlatConfig = (rules) => ({
  plugins: {
    jest: plugin
  },
  languageOptions: {
    globals
  },
  rules
});

// Assign configurations to the plugin
plugin.configs = {
  all: createRCConfig(allRules),
  recommended: createRCConfig(recommendedRules),
  style: createRCConfig(styleRules),
  'flat/all': createFlatConfig(allRules),
  'flat/recommended': createFlatConfig(recommendedRules),
  'flat/style': createFlatConfig(styleRules)
};

// Export the configured plugin
module.exports = plugin;
