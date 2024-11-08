const path = require('path');

const endsWith = (ext) => (filename) => filename.endsWith(ext);

const extensions = {
  '.babel.js': createBabelConfig('@babel/preset-env', endsWith('.babel.js'), '.js'),
  '.babel.jsx': createBabelConfig(
    ['@babel/preset-env', '@babel/preset-react'],
    endsWith('.babel.jsx'),
    '.jsx'
  ),
  '.babel.ts': [
    createBabelConfig(
      ['@babel/preset-env', '@babel/preset-typescript'],
      endsWith('.babel.ts'),
      '.ts'
    ),
  ],
  '.babel.tsx': createBabelConfig(
    [
      '@babel/preset-env',
      '@babel/preset-react',
      [
        '@babel/preset-typescript',
        { isTSX: true, allExtensions: true },
      ],
    ],
    endsWith('.babel.tsx'),
    '.tsx'
  ),
  '.cjs': createPathStub('cjs-stub'),
  '.coffee': 'coffeescript/register',
  '.coffee.md': 'coffeescript/register',
  '.esbuild.js': createEsbuildConfig(endsWith('.esbuild.js'), '.js'),
  '.esbuild.jsx': createEsbuildConfig(endsWith('.esbuild.jsx'), '.jsx'),
  '.esbuild.ts': createEsbuildConfig(endsWith('.esbuild.ts'), '.ts'),
  '.esbuild.tsx': createEsbuildConfig(endsWith('.esbuild.tsx'), '.tsx'),
  '.esm.js': createEsmConfig(),
  '.jsx': [
    createBabelConfig(
      ['@babel/preset-env', '@babel/preset-react'],
      endsWith('.jsx'),
      '.jsx'
    ),
    'sucrase/register/jsx',
  ],
  '.litcoffee': 'coffeescript/register',
  '.mdx': '@mdx-js/register',
  '.mjs': createPathStub('mjs-stub'),
  '.sucrase.js': createSucraseConfig('JS', endsWith('.sucrase.js')),
  '.sucrase.jsx': createSucraseConfig('JSX', endsWith('.sucrase.jsx')),
  '.sucrase.ts': createSucraseConfig('TS', endsWith('.sucrase.ts')),
  '.sucrase.tsx': createSucraseConfig('TSX', endsWith('.sucrase.tsx')),
  '.swc.js': createSwcConfig(endsWith('.swc.js'), '.js', 'ecmascript'),
  '.swc.jsx': createSwcConfig(endsWith('.swc.jsx'), '.jsx', 'ecmascript', true),
  '.swc.ts': createSwcConfig(endsWith('.swc.ts'), '.ts', 'typescript'),
  '.swc.tsx': createSwcConfig(endsWith('.swc.tsx'), '.tsx', 'typescript', false, true),
  '.ts': createTsConfig(endsWith('.ts'), '.ts'),
  '.tsx': createTsConfig(endsWith('.tsx'), '.tsx', true),
  '.yaml': 'yaml-hook/register',
  '.yml': 'yaml-hook/register',
};

const jsVariantExtensions = [
  '.js', '.babel.js', '.babel.jsx', '.babel.ts', '.babel.tsx',
  '.esbuild.js', '.esbuild.jsx', '.esbuild.ts', '.esbuild.tsx',
  '.cjs', '.coffee', '.coffee.md', '.esm.js',
  '.jsx', '.litcoffee', '.mdx', '.mjs',
  '.sucrase.js', '.sucrase.jsx', '.sucrase.ts', '.sucrase.tsx',
  '.swc.js', '.swc.jsx', '.swc.ts', '.swc.tsx',
  '.ts', '.tsx',
];

function createBabelConfig(presets, matcher, ext) {
  return {
    module: '@babel/register',
    register(hook, config) {
      config = config || {
        rootMode: 'upward-optional',
        overrides: [{ only: [matcher], presets }],
      };
      hook(Object.assign({}, config, { extensions: ext }));
    },
  };
}

function createPathStub(stubName) {
  return path.join(__dirname, stubName);
}

function createEsbuildConfig(matcher, ext) {
  return {
    module: 'esbuild-register/dist/node',
    register(mod, config) {
      config = config || {
        target: 'node' + process.version.slice(1),
        hookMatcher: matcher,
      };
      mod.register(Object.assign({}, config, { extensions: [ext] }));
    },
  };
}

function createEsmConfig() {
  return {
    module: 'esm',
    register(hook) {
      const esmLoader = hook(module);
      require.extensions['.js'] = esmLoader('module')._extensions['.js'];
    },
  };
}

function createSucraseConfig(jsType, matcher) {
  return {
    module: 'sucrase/dist/register',
    register(hook, config) {
      config = config || { matcher };
      hook[`register${jsType}`](config);
    },
  };
}

function createSwcConfig(matcher, ext, syntax, jsx = false, tsx = false) {
  return {
    module: '@swc/register',
    register(hook, config) {
      config = config || {
        only: [matcher],
        ignore: [(file) => path.relative(process.cwd(), file).includes('node_modules')],
        jsc: { parser: { syntax, jsx, tsx } },
        module: { type: 'commonjs' },
      };
      hook(Object.assign({}, config, { extensions: ext }));
    },
  };
}

function createTsConfig(matcher, ext, tsx = false) {
  const tsPresets = tsx
    ? [
        '@babel/preset-env',
        '@babel/preset-react',
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
      ]
    : ['@babel/preset-env', '@babel/preset-typescript'];

  return [
    'ts-node/register',
    `sucrase/register/${tsx ? 'tsx' : 'ts'}`,
    createBabelConfig(tsPresets, matcher, ext),
    createEsbuildConfig(matcher, ext),
    createSwcConfig(matcher, ext, 'typescript', undefined, tsx),
  ];
}

module.exports = {
  extensions,
  jsVariants: jsVariantExtensions.reduce((res, ext) => ({ ...res, [ext]: extensions[ext] }), {}),
};
