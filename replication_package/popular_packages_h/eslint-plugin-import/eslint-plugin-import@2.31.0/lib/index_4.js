'use strict';

const { name, version } = require('../package.json');

// Export a comprehensive list of custom rules for ESLint
const rules = {
  'no-unresolved': require('./rules/no-unresolved'),
  named: require('./rules/named'),
  default: require('./rules/default'),
  namespace: require('./rules/namespace'),
  'no-namespace': require('./rules/no-namespace'),
  export: require('./rules/export'),
  'no-mutable-exports': require('./rules/no-mutable-exports'),
  extensions: require('./rules/extensions'),
  'no-restricted-paths': require('./rules/no-restricted-paths'),
  'no-internal-modules': require('./rules/no-internal-modules'),
  'group-exports': require('./rules/group-exports'),
  'no-relative-packages': require('./rules/no-relative-packages'),
  'no-relative-parent-imports': require('./rules/no-relative-parent-imports'),
  'consistent-type-specifier-style': require('./rules/consistent-type-specifier-style'),
  'no-self-import': require('./rules/no-self-import'),
  'no-cycle': require('./rules/no-cycle'),
  'no-named-default': require('./rules/no-named-default'),
  'no-named-as-default': require('./rules/no-named-as-default'),
  'no-named-as-default-member': require('./rules/no-named-as-default-member'),
  'no-anonymous-default-export': require('./rules/no-anonymous-default-export'),
  'no-unused-modules': require('./rules/no-unused-modules'),
  'no-commonjs': require('./rules/no-commonjs'),
  'no-amd': require('./rules/no-amd'),
  'no-duplicates': require('./rules/no-duplicates'),
  first: require('./rules/first'),
  'max-dependencies': require('./rules/max-dependencies'),
  'no-extraneous-dependencies': require('./rules/no-extraneous-dependencies'),
  'no-absolute-path': require('./rules/no-absolute-path'),
  'no-nodejs-modules': require('./rules/no-nodejs-modules'),
  'no-webpack-loader-syntax': require('./rules/no-webpack-loader-syntax'),
  order: require('./rules/order'),
  'newline-after-import': require('./rules/newline-after-import'),
  'prefer-default-export': require('./rules/prefer-default-export'),
  'no-default-export': require('./rules/no-default-export'),
  'no-named-export': require('./rules/no-named-export'),
  'no-dynamic-require': require('./rules/no-dynamic-require'),
  unambiguous: require('./rules/unambiguous'),
  'no-unassigned-import': require('./rules/no-unassigned-import'),
  'no-useless-path-segments': require('./rules/no-useless-path-segments'),
  'dynamic-import-chunkname': require('./rules/dynamic-import-chunkname'),
  'no-import-module-exports': require('./rules/no-import-module-exports'),
  'no-empty-named-blocks': require('./rules/no-empty-named-blocks'),
  'exports-last': require('./rules/exports-last'),
  'no-deprecated': require('./rules/no-deprecated'),
  'imports-first': require('./rules/imports-first')
};

// Export default configurations suitable for external usage in various environments
const configs = {
  recommended: require('../config/recommended'),
  errors: require('../config/errors'),
  warnings: require('../config/warnings'),
  'stage-0': require('../config/stage-0'),
  react: require('../config/react'),
  'react-native': require('../config/react-native'),
  electron: require('../config/electron'),
  typescript: require('../config/typescript')
};

// Define the plugin itself, consisting of metadata and rules
const importPlugin = {
  meta: { name, version },
  rules
};

// Generate flat configuration objects incorporating plugins and parser options
const createFlatConfig = (baseConfig, configName) => ({
  ...baseConfig,
  name: `import/${configName}`,
  plugins: { import: importPlugin }
});

// Define and export flat configurations for various configurations
const flatConfigs = {
  recommended: createFlatConfig(require('../config/flat/recommended'), 'recommended'),
  errors: createFlatConfig(require('../config/flat/errors'), 'errors'),
  warnings: createFlatConfig(require('../config/flat/warnings'), 'warnings'),
  react: require('../config/flat/react'),
  'react-native': configs['react-native'],
  electron: configs.electron,
  typescript: configs.typescript
};

module.exports = {
  rules,
  configs,
  flatConfigs
};
