const path = require('path');

// Helper functions to check file extensions
const endsIn = (ext) => (filename) => filename.endsWith(ext);

const createEndsInFunctions = (extensions) => {
  const funcs = {};
  extensions.forEach((ext) => {
    funcs[`endsIn${ext.replace(/[\.\-]/g, '')}`] = endsIn(ext);
  });
  return funcs;
};

const matchers = createEndsInFunctions([
  '.jsx', '.ts', '.tsx', 
  '.babel.js', '.babel.jsx', '.babel.ts', '.babel.tsx', 
  '.esbuild.js', '.esbuild.jsx', '.esbuild.ts', '.esbuild.tsx', 
  '.sucrase.js', '.sucrase.jsx', '.sucrase.ts', '.sucrase.tsx', 
  '.swc.js', '.swc.jsx', '.swc.ts', '.swc.tsx'
]);

const { 
  endsInJsx, endsInTs, endsInTsx,
  endsInBabelJs, endsInBabelJsx, endsInBabelTs, endsInBabelTsx, 
  endsInEsbuildJs, endsInEsbuildJsx, endsInEsbuildTs, endsInEsbuildTsx, 
  endsInSucraseJs, endsInSucraseJsx, endsInSucraseTs, endsInSucraseTsx, 
  endsInSwcJs, endsInSwcJsx, endsInSwcTs, endsInSwcTsx
} = matchers;

// Paths to stub files
const cjsStub = path.join(__dirname, 'cjs-stub');
const mjsStub = path.join(__dirname, 'mjs-stub');

// Checks if a file is within the node_modules directory
const isNodeModules = (file) => path.relative(process.cwd(), file).includes('node_modules');

// Extension to module configuration mappings
const extensions = {
  '.babel.js': {
    module: '@babel/register',
    register: (hook, config) => {
      hook(Object.assign({}, config || {
        rootMode: 'upward-optional',
        overrides: [{ only: [endsInBabelJs], presets: ['@babel/preset-env'] }]
      }, { extensions: '.js' }));
    },
  },
  '.babel.jsx': {
    module: '@babel/register',
    register: (hook, config) => {
      hook(Object.assign({}, config || {
        rootMode: 'upward-optional',
        overrides: [{ only: [endsInBabelJsx], presets: ['@babel/preset-env', '@babel/preset-react'] }]
      }, { extensions: '.jsx' }));
    },
  },
  '.babel.ts': [
    {
      module: '@babel/register',
      register: (hook, config) => {
        hook(Object.assign({}, config || {
          rootMode: 'upward-optional',
          overrides: [{ only: [endsInBabelTs], presets: ['@babel/preset-env', '@babel/preset-typescript'] }]
        }, { extensions: '.ts' }));
      },
    },
  ],
  '.babel.tsx': {
    module: '@babel/register',
    register: (hook, config) => {
      hook(Object.assign({}, config || {
        rootMode: 'upward-optional',
        overrides: [{
          only: [endsInBabelTsx],
          presets: ['@babel/preset-env', '@babel/preset-react', ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]]
        }]
      }, { extensions: '.tsx' }));
    },
  },
  '.cjs': cjsStub,
  '.coffee': 'coffeescript/register',
  '.coffee.md': 'coffeescript/register',
  '.esbuild.js': {
    module: 'esbuild-register/dist/node',
    register: (mod, config) => {
      mod.register(Object.assign({}, config || {
        target: 'node' + process.version.slice(1),
        hookMatcher: endsInEsbuildJs
      }, { extensions: ['.js'] }));
    },
  },
  '.esbuild.jsx': {
    module: 'esbuild-register/dist/node',
    register: (mod, config) => {
      mod.register(Object.assign({}, config || {
        target: 'node' + process.version.slice(1),
        hookMatcher: endsInEsbuildJsx
      }, { extensions: ['.jsx'] }));
    },
  },
  '.esbuild.ts': {
    module: 'esbuild-register/dist/node',
    register: (mod, config) => {
      mod.register(Object.assign({}, config || {
        target: 'node' + process.version.slice(1),
        hookMatcher: endsInEsbuildTs
      }, { extensions: ['.ts'] }));
    },
  },
  '.esbuild.tsx': {
    module: 'esbuild-register/dist/node',
    register: (mod, config) => {
      mod.register(Object.assign({}, config || {
        target: 'node' + process.version.slice(1),
        hookMatcher: endsInEsbuildTsx
      }, { extensions: ['.tsx'] }));
    },
  },
  '.esm.js': {
    module: 'esm',
    register: (hook) => {
      const esmLoader = hook(module);
      require.extensions['.js'] = esmLoader('module')._extensions['.js'];
    },
  },
  '.js': null,
  '.json': null,
  '.json5': 'json5/lib/register',
  '.jsx': [
    {
      module: '@babel/register',
      register: (hook, config) => {
        hook(Object.assign({}, config || {
          rootMode: 'upward-optional',
          overrides: [{ only: [endsInJsx], presets: ['@babel/preset-env', '@babel/preset-react'] }]
        }, { extensions: '.jsx' }));
      },
    },
    'sucrase/register/jsx',
  ],
  '.litcoffee': 'coffeescript/register',
  '.mdx': '@mdx-js/register',
  '.mjs': mjsStub,
  '.node': null,
  '.sucrase.js': {
    module: 'sucrase/dist/register',
    register: (hook, config) => {
      hook.registerJS(config || { matcher: endsInSucraseJs });
    },
  },
  '.sucrase.jsx': {
    module: 'sucrase/dist/register',
    register: (hook, config) => {
      hook.registerJSX(config || { matcher: endsInSucraseJsx });
    },
  },
  '.sucrase.ts': {
    module: 'sucrase/dist/register',
    register: (hook, config) => {
      hook.registerTS(config || { matcher: endsInSucraseTs });
    },
  },
  '.sucrase.tsx': {
    module: 'sucrase/dist/register',
    register: (hook, config) => {
      hook.registerTSX(config || { matcher: endsInSucraseTsx });
    },
  },
  '.swc.js': {
    module: '@swc/register',
    register: (hook, config) => {
      hook(Object.assign({}, config || {
        only: [endsInSwcJs],
        ignore: [isNodeModules],
        jsc: { parser: { syntax: 'ecmascript' }, },
        module: { type: 'commonjs' }
      }, { extensions: '.js' }));
    },
  },
  '.swc.jsx': {
    module: '@swc/register',
    register: (hook, config) => {
      hook(Object.assign({}, config || {
        only: [endsInSwcJsx],
        ignore: [isNodeModules],
        jsc: { parser: { syntax: 'ecmascript', jsx: true }, },
        module: { type: 'commonjs' }
      }, { extensions: '.jsx' }));
    },
  },
  '.swc.ts': {
    module: '@swc/register',
    register: (hook, config) => {
      hook(Object.assign({}, config || {
        only: [endsInSwcTs],
        ignore: [isNodeModules],
        jsc: { parser: { syntax: 'typescript' }, },
        module: { type: 'commonjs' }
      }, { extensions: '.ts' }));
    },
  },
  '.swc.tsx': {
    module: '@swc/register',
    register: (hook, config) => {
      hook(Object.assign({}, config || {
        only: [endsInSwcTsx],
        ignore: [isNodeModules],
        jsc: { parser: { syntax: 'typescript', tsx: true }, },
        module: { type: 'commonjs' }
      }, { extensions: '.tsx' }));
    },
  },
  '.toml': {
    module: 'toml-require',
    register: (hook, config) => {
      hook.install(config);
    },
  },
  '.ts': [
    'ts-node/register',
    'sucrase/register/ts',
    {
      module: '@babel/register',
      register: (hook, config) => {
        hook(Object.assign({}, config || {
          rootMode: 'upward-optional',
          overrides: [{ only: [endsInTs], presets: ['@babel/preset-env', '@babel/preset-typescript'] }]
        }, { extensions: '.ts' }));
      },
    },
    {
      module: 'esbuild-register/dist/node',
      register: (mod, config) => {
        mod.register(Object.assign({}, config || {
          target: 'node' + process.version.slice(1),
          hookMatcher: endsInTs
        }, { extensions: ['.ts'] }));
      },
    },
    {
      module: '@swc/register',
      register: (hook, config) => {
        hook(Object.assign({}, config || {
          only: [endsInTs],
          ignore: [isNodeModules],
          jsc: { parser: { syntax: 'typescript' }, },
          module: { type: 'commonjs' }
        }, { extensions: '.ts' }));
      },
    },
  ],
  '.cts': ['ts-node/register'],
  '.tsx': [
    'ts-node/register',
    'sucrase/register/tsx',
    {
      module: '@babel/register',
      register: (hook, config) => {
        hook(Object.assign({}, config || {
          rootMode: 'upward-optional',
          overrides: [{
            only: [endsInTsx],
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
            ]
          }]
        }, { extensions: '.tsx' }));
      },
    },
    {
      module: 'esbuild-register/dist/node',
      register: (mod, config) => {
        mod.register(Object.assign({}, config || {
          target: 'node' + process.version.slice(1),
          hookMatcher: endsInTsx
        }, { extensions: ['.tsx'] }));
      },
    },
    {
      module: '@swc/register',
      register: (hook, config) => {
        hook(Object.assign({}, config || {
          only: [endsInTsx],
          ignore: [isNodeModules],
          jsc: { parser: { syntax: 'typescript', tsx: true }, },
          module: { type: 'commonjs' }
        }, { extensions: '.tsx' }));
      },
    },
  ],
  '.yaml': 'yaml-hook/register',
  '.yml': 'yaml-hook/register',
};

const jsVariantExtensions = [
  '.js', '.babel.js', '.babel.jsx', '.babel.ts', '.babel.tsx',
  '.esbuild.js', '.esbuild.jsx', '.esbuild.ts', '.esbuild.tsx',
  '.cjs', '.coffee', '.coffee.md', '.esm.js', '.jsx', '.litcoffee', 
  '.mdx', '.mjs', '.sucrase.js', '.sucrase.jsx', '.sucrase.ts', 
  '.sucrase.tsx', '.swc.js', '.swc.jsx', '.swc.ts', '.swc.tsx', 
  '.ts', '.tsx'
];

module.exports = {
  extensions,
  jsVariants: jsVariantExtensions.reduce((result, ext) => {
    result[ext] = extensions[ext];
    return result;
  }, {}),
};
