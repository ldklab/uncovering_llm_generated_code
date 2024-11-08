// interpret/index.js

const loaders = {
  '.babel.js': '@babel/register',
  '.babel.jsx': '@babel/register',
  '.babel.ts': '@babel/register',
  '.babel.tsx': '@babel/register',
  '.cjs': 'interpret/cjs-stub',
  '.coffee': 'coffeescript/register',
  '.coffee.md': 'coffeescript/register',
  '.cts': 'ts-node/register',
  '.esbuild.js': 'esbuild-register/dist/node',
  '.esbuild.jsx': 'esbuild-register/dist/node',
  '.esbuild.ts': 'esbuild-register/dist/node',
  '.esbuild.tsx': 'esbuild-register/dist/node',
  '.esm.js': 'esm',
  '.js': null,
  '.json': null,
  '.json5': 'json5/lib/register',
  '.jsx': ['@babel/register', 'sucrase/register/jsx'],
  '.litcoffee': 'coffeescript/register',
  '.mdx': '@mdx-js/register',
  '.mjs': 'interpret/mjs-stub',
  '.node': null,
  '.sucrase.js': 'sucrase/dist/register',
  '.sucrase.jsx': 'sucrase/dist/register',
  '.sucrase.ts': 'sucrase/dist/register',
  '.sucrase.tsx': 'sucrase/dist/register',
  '.swc.js': '@swc/register',
  '.swc.jsx': '@swc/register',
  '.swc.ts': '@swc/register',
  '.swc.tsx': '@swc/register',
  '.toml': 'toml-require',
  '.ts': ['ts-node/register', 'sucrase/register/ts', {
    module: '@babel/register',
    register: hook => hook({
      extensions: '.ts',
      rootMode: 'upward-optional',
      ignore: [],
    }),
  }, 'esbuild-register/dist/node', '@swc/register'],
  '.tsx': ['ts-node/register', 'sucrase/register/tsx', {
    module: '@babel/register',
    register: hook => hook({
      extensions: '.tsx',
      rootMode: 'upward-optional',
      ignore: [],
    }),
  }, 'esbuild-register/dist/node', '@swc/register'],
  '.yaml': 'yaml-hook/register',
  '.yml': 'yaml-hook/register',
};

const jsFileVariants = Object.entries(loaders)
  .filter(([ext]) => [
    '.babel.js', '.babel.jsx', '.babel.ts', '.babel.tsx', '.cjs', '.coffee', 
    '.coffee.md', '.esbuild.js', '.esbuild.jsx', '.esbuild.ts', '.esbuild.tsx', 
    '.esm.js', '.js', '.jsx', '.litcoffee', '.mdx', '.mjs', '.sucrase.js', 
    '.sucrase.jsx', '.sucrase.ts', '.sucrase.tsx', '.swc.js', '.swc.jsx', 
    '.swc.ts', '.swc.tsx', '.ts', '.tsx']
    .includes(ext))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

module.exports = { extensions: loaders, jsVariants: jsFileVariants };
