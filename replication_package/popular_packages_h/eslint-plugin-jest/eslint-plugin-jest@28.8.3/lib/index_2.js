"use strict";

const fs = require("fs");
const path = require("path");
const packageConfig = require("../package.json");
const globals = require("./globals.json");

const interopRequireDefault = module => (module && module.__esModule ? module : { default: module });
const importDefault = moduleName => interopRequireDefault(require(moduleName)).default;

const rulesDir = path.join(__dirname, 'rules');
const excludedFiles = ['__tests__', 'detectJestVersion', 'utils'];

const rules = Object.fromEntries(
  fs.readdirSync(rulesDir)
    .map(file => path.parse(file).name)
    .filter(ruleName => !excludedFiles.includes(ruleName))
    .map(ruleName => [ruleName, importDefault(path.join(rulesDir, ruleName))])
);

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
  Object.entries(rules).filter(([, rule]) => !rule.meta.deprecated)
    .map(([name]) => [`jest/${name}`, 'error'])
);

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

const createRCConfig = (rulesConfig) => ({
  plugins: ['jest'],
  env: { 'jest/globals': true },
  rules: rulesConfig
});

const createFlatConfig = (rulesConfig) => ({
  plugins: { jest: plugin },
  languageOptions: { globals },
  rules: rulesConfig
});

plugin.configs = {
  all: createRCConfig(allRules),
  recommended: createRCConfig(recommendedRules),
  style: createRCConfig(styleRules),
  'flat/all': createFlatConfig(allRules),
  'flat/recommended': createFlatConfig(recommendedRules),
  'flat/style': createFlatConfig(styleRules)
};

module.exports = plugin;
