const path = require('path');

const endsWithExtension = (ext) => (filename) => filename.endsWith(ext);
const createPath = (filename) => path.join(__dirname, filename);
const isNodeModules = (file) => path.relative(process.cwd(), file).includes('node_modules');

const extensions = {
  '.babel.js': {
    module: '@babel/register',
    register(hook, config) {
      hook({
        rootMode: 'upward-optional',
        overrides: [{
          only: [endsWithExtension('.babel.js')],
          presets: ['@babel/preset-env']
        }],
        extensions: '.js',
        ...config
      });
    }
  },
  '.babel.jsx': {
    module: '@babel/register',
    register(hook, config) {
      hook({
        rootMode: 'upward-optional',
        overrides: [{
          only: [endsWithExtension('.babel.jsx')],
          presets: ['@babel/preset-env', '@babel/preset-react']
        }],
        extensions: '.jsx',
        ...config
      });
    }
  },
  '.babel.ts': {
    module: '@babel/register',
    register(hook, config) {
      hook({
        rootMode: 'upward-optional',
        overrides: [{
          only: [endsWithExtension('.babel.ts')],
          presets: ['@babel/preset-env', '@babel/preset-typescript']
        }],
        extensions: '.ts',
        ...config
      });
    }
  },
  '.babel.tsx': {
    module: '@babel/register',
    register(hook, config) {
      hook({
        rootMode: 'upward-optional',
        overrides: [{
          only: [endsWithExtension('.babel.tsx')],
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
            ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
          ]
        }],
        extensions: '.tsx',
        ...config
      });
    }
  },
  '.cjs': createPath('cjs-stub'),
  '.coffee': 'coffeescript/register',
  '.coffee.md': 'coffeescript/register',
  '.esbuild.js': {
    module: 'esbuild-register/dist/node',
    register(mod, config) {
      mod.register({
        target: 'node' + process.version.slice(1),
        hookMatcher: endsWithExtension('.esbuild.js'),
        extensions: ['.js'],
        ...config
      });
    }
  },
  '.esbuild.jsx': {
    module: 'esbuild-register/dist/node',
    register(mod, config) {
      mod.register({
        target: 'node' + process.version.slice(1),
        hookMatcher: endsWithExtension('.esbuild.jsx'),
        extensions: ['.jsx'],
        ...config
      });
    }
  },
  '.esbuild.ts': {
    module: 'esbuild-register/dist/node',
    register(mod, config) {
      mod.register({
        target: 'node' + process.version.slice(1),
        hookMatcher: endsWithExtension('.esbuild.ts'),
        extensions: ['.ts'],
        ...config
      });
    }
  },
  '.esbuild.tsx': {
    module: 'esbuild-register/dist/node',
    register(mod, config) {
      mod.register({
        target: 'node' + process.version.slice(1),
        hookMatcher: endsWithExtension('.esbuild.tsx'),
        extensions: ['.tsx'],
        ...config
      });
    }
  },
  '.esm.js': {
    module: 'esm',
    register(hook) {
      const esmLoader = hook(module);
      require.extensions['.js'] = esmLoader('module')._extensions['.js'];
    }
  },
  '.json': null,
  '.json5': 'json5/lib/register',
  '.jsx': [
    '@babel/register',
    'sucrase/register/jsx',
    {
      module: '@babel/register',
      register(hook, config) {
        hook({
          rootMode: 'upward-optional',
          overrides: [{
            only: [endsWithExtension('.jsx')],
            presets: ['@babel/preset-env', '@babel/preset-react']
          }],
          extensions: '.jsx',
          ...config
        });
      }
    }
  ],
  '.litcoffee': 'coffeescript/register',
  '.mdx': '@mdx-js/register',
  '.mjs': createPath('mjs-stub'),
  '.node': null,
  '.sucrase.js': {
    module: 'sucrase/dist/register',
    register(hook, config) {
      hook.registerJS({ matcher: endsWithExtension('.sucrase.js'), ...config });
    }
  },
  '.sucrase.jsx': {
    module: 'sucrase/dist/register',
    register(hook, config) {
      hook.registerJSX({ matcher: endsWithExtension('.sucrase.jsx'), ...config });
    }
  },
  '.sucrase.ts': {
    module: 'sucrase/dist/register',
    register(hook, config) {
      hook.registerTS({ matcher: endsWithExtension('.sucrase.ts'), ...config });
    }
  },
 .sucrase.tsx': {
    module: 'sucrase/dist/register',
    register(hook, config) {
      hook.registerTSX({ matcher: endsWithExtension('.sucrase.tsx'), ...config });
    }
  },
  '.swc.js': {
    module: '@swc/register',
    register(hook, config) {
      hook({
        only: [endsWithExtension('.swc.js')],
        ignore: [isNodeModules],
        jsc: {parser: {syntax: 'ecmascript'}},
        module: {type: 'commonjs'},
        extensions: '.js',
        ...config
      });
    }
  },
  '.swc.jsx': {
    module: '@swc/register',
    register(hook, config) {
      hook({
        only: [endsWithExtension('.swc.jsx')],
        ignore: [isNodeModules],
        jsc: {parser: {syntax: 'ecmascript', jsx: true}},
        module: {type: 'commonjs'},
        extensions: '.jsx',
        ...config
      });
    }
  },
  '.swc.ts': {
    module: '@swc/register',
    register(hook, config) {
      hook({
        only: [endsWithExtension('.swc.ts')],
        ignore: [isNodeModules],
        jsc: {parser: {syntax: 'typescript'}},
        module: {type: 'commonjs'},
        extensions: '.ts',
        ...config
      });
    }
  },
  '.swc.tsx': {
    module: '@swc/register',
    register(hook, config) {
      hook({
        only: [endsWithExtension('.swc.tsx')],
        ignore: [isNodeModules],
        jsc: {parser: {syntax: 'typescript', tsx: true}},
        module: {type: 'commonjs'},
        extensions: '.tsx',
        ...config
      });
    }
  },
  '.ts': [
    'ts-node/register',
    'sucrase/register/ts',
    {
      module: '@babel/register',
      register(hook, config) {
        hook({
          rootMode: 'upward-optional',
          overrides: [{
            only: [endsWithExtension('.ts')],
            presets: ['@babel/preset-env', '@babel/preset-typescript']
          }],
          extensions: '.ts',
          ...config
        });
      }
    },
    'esbuild-register/dist/node',
    '@swc/register'
  ],
  '.tsx': [
    'ts-node/register',
    'sucrase/register/tsx',
    {
      module: '@babel/register',
      register(hook, config) {
        hook({
          rootMode: 'upward-optional',
          overrides: [{
            only: [endsWithExtension('.tsx')],
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
            ]
          }],
          extensions: '.tsx',
          ...config
        });
      }
    },
    'esbuild-register/dist/node',
    '@swc/register'
  ],
  '.yaml': 'yaml-hook/register',
  '.yml': 'yaml-hook/register',
  '.toml': {
    module: 'toml-require',
    register(hook, config) {
      hook.install(config);
    }
  }
};

const jsVariantExtensions = [
  '.js', '.babel.js', '.babel.jsx', '.babel.ts', '.babel.tsx', '.esbuild.js',
  '.esbuild.jsx', '.esbuild.ts', '.esbuild.tsx', '.cjs', '.coffee',
  '.coffee.md', '.esm.js', '.jsx','.litcoffee', '.mdx', '.mjs', '.sucrase.js',
  '.sucrase.jsx', '.sucrase.ts', '.sucrase.tsx', '.swc.js', '.swc.jsx', '.swc.ts',
  '.swc.tsx', '.ts', '.tsx'
];

module.exports = {
  extensions,
  jsVariants: jsVariantExtensions.reduce((result, ext) => {
    result[ext] = extensions[ext];
    return result;
  }, {})
};
