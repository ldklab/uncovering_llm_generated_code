'use strict';
Object.defineProperty(exports, "__esModule", { value: true });

const importRule = path => require(`./rules/${path}`);
const importConfig = path => require(`../config/${path}`);

const rules = exports.rules = {
  'no-unresolved': importRule('no-unresolved'),
  'named': importRule('named'),
  'default': importRule('default'),
  'namespace': importRule('namespace'),
  'no-namespace': importRule('no-namespace'),
  'export': importRule('export'),
  'no-mutable-exports': importRule('no-mutable-exports'),
  'extensions': importRule('extensions'),
  'no-restricted-paths': importRule('no-restricted-paths'),
  'no-internal-modules': importRule('no-internal-modules'),
  'group-exports': importRule('group-exports'),
  'no-relative-parent-imports': importRule('no-relative-parent-imports'),
  'no-self-import': importRule('no-self-import'),
  'no-cycle': importRule('no-cycle'),
  'no-named-default': importRule('no-named-default'),
  'no-named-as-default': importRule('no-named-as-default'),
  'no-named-as-default-member': importRule('no-named-as-default-member'),
  'no-anonymous-default-export': importRule('no-anonymous-default-export'),
  'no-unused-modules': importRule('no-unused-modules'),
  'no-commonjs': importRule('no-commonjs'),
  'no-amd': importRule('no-amd'),
  'no-duplicates': importRule('no-duplicates'),
  'first': importRule('first'),
  'max-dependencies': importRule('max-dependencies'),
  'no-extraneous-dependencies': importRule('no-extraneous-dependencies'),
  'no-absolute-path': importRule('no-absolute-path'),
  'no-nodejs-modules': importRule('no-nodejs-modules'),
  'no-webpack-loader-syntax': importRule('no-webpack-loader-syntax'),
  'order': importRule('order'),
  'newline-after-import': importRule('newline-after-import'),
  'prefer-default-export': importRule('prefer-default-export'),
  'no-default-export': importRule('no-default-export'),
  'no-named-export': importRule('no-named-export'),
  'no-dynamic-require': importRule('no-dynamic-require'),
  'unambiguous': importRule('unambiguous'),
  'no-unassigned-import': importRule('no-unassigned-import'),
  'no-useless-path-segments': importRule('no-useless-path-segments'),
  'dynamic-import-chunkname': importRule('dynamic-import-chunkname'),
  'exports-last': importRule('exports-last'),
  'no-deprecated': importRule('no-deprecated'),
  'imports-first': importRule('imports-first')
};

const configs = exports.configs = {
  'recommended': importConfig('recommended'),
  'errors': importConfig('errors'),
  'warnings': importConfig('warnings'),
  'stage-0': importConfig('stage-0'),
  'react': importConfig('react'),
  'react-native': importConfig('react-native'),
  'electron': importConfig('electron'),
  'typescript': importConfig('typescript')
};
