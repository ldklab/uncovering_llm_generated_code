const path = require('path');

const filenameMatchers = {
  '.jsx': filename => filename.endsWith('.jsx'),
  '.ts': filename => filename.endsWith('.ts'),
  '.tsx': filename => filename.endsWith('.tsx'),
  '.babel.js': filename => filename.endsWith('.babel.js'),
  '.babel.jsx': filename => filename.endsWith('.babel.jsx'),
  '.babel.ts': filename => filename.endsWith('.babel.ts'),
  '.babel.tsx': filename => filename.endsWith('.babel.tsx'),
  '.esbuild.js': filename => filename.endsWith('.esbuild.js'),
  '.esbuild.jsx': filename => filename.endsWith('.esbuild.jsx'),
  '.esbuild.ts': filename => filename.endsWith('.esbuild.ts'),
  '.esbuild.tsx': filename => filename.endsWith('.esbuild.tsx'),
  '.sucrase.js': filename => filename.endsWith('.sucrase.js'),
  '.sucrase.jsx': filename => filename.endsWith('.sucrase.jsx'),
  '.sucrase.ts': filename => filename.endsWith('.sucrase.ts'),
  '.sucrase.tsx': filename => filename.endsWith('.sucrase.tsx'),
  '.swc.js': filename => filename.endsWith('.swc.js'),
  '.swc.jsx': filename => filename.endsWith('.swc.jsx'),
  '.swc.ts': filename => filename.endsWith('.swc.ts'),
  '.swc.tsx': filename => filename.endsWith('.swc.tsx')
};

const isNodeModules = file => path.relative(process.cwd(), file).includes('node_modules');

const stubs = {
  cjsStub: path.join(__dirname, 'cjs-stub'),
  mjsStub: path.join(__dirname, 'mjs-stub')
};

function getBabelConfig(ext, presets) {
  return {
    rootMode: 'upward-optional',
    overrides: [{
      only: [filenameMatchers[ext]],
      presets: presets
    }]
  };
}

function getEsbuildConfig(target, hookMatcher) {
  return {
    target: target,
    hookMatcher: hookMatcher
  };
}

function getSWCConfig(ext, syntax, tsx = false) {
  return {
    only: [filenameMatchers[ext]],
    ignore: [isNodeModules],
    jsc: {
      parser: {
        syntax: syntax,
        tsx: tsx
      }
    },
    module: {
      type: 'commonjs'
    }
  };
}

const extensions = {
  '.babel.js': {
    module: '@babel/register',
    register: (hook, config) => {
      config = config || getBabelConfig('.babel.js', ['@babel/preset-env']);
      hook(Object.assign({}, config, { extensions: '.js' }));
    }
  },
  '.babel.jsx': {
    module: '@babel/register',
    register: (hook, config) => {
      config = config || getBabelConfig('.babel.jsx', ['@babel/preset-env', '@babel/preset-react']);
      hook(Object.assign({}, config, { extensions: '.jsx' }));
    }
  },
  '.babel.ts': {
    module: '@babel/register',
    register: (hook, config) => {
      config = config || getBabelConfig('.babel.ts', ['@babel/preset-env', '@babel/preset-typescript']);
      hook(Object.assign({}, config, { extensions: '.ts' }));
    }
  },
  '.babel.tsx': {
    module: '@babel/register',
    register: (hook, config) => {
      config = config || getBabelConfig('.babel.tsx', ['@babel/preset-env', '@babel/preset-react', ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]]);
      hook(Object.assign({}, config, { extensions: '.tsx' }));
    }
  },
  '.esbuild.js': {
    module: 'esbuild-register/dist/node',
    register: (mod, config) => {
      config = config || getEsbuildConfig('node' + process.version.slice(1), filenameMatchers['.esbuild.js']);
      mod.register(Object.assign({}, config, { extensions: ['.js'] }));
    }
  },
  '.esbuild.jsx': {
    module: 'esbuild-register/dist/node',
    register: (mod, config) => {
      config = config || getEsbuildConfig('node' + process.version.slice(1), filenameMatchers['.esbuild.jsx']);
      mod.register(Object.assign({}, config, { extensions: ['.jsx'] }));
    }
  },
  '.esbuild.ts': {
    module: 'esbuild-register/dist/node',
    register: (mod, config) => {
      config = config || getEsbuildConfig('node' + process.version.slice(1), filenameMatchers['.esbuild.ts']);
      mod.register(Object.assign({}, config, { extensions: ['.ts'] }));
    }
  },
  '.esbuild.tsx': {
    module: 'esbuild-register/dist/node',
    register: (mod, config) => {
      config = config || getEsbuildConfig('node' + process.version.slice(1), filenameMatchers['.esbuild.tsx']);
      mod.register(Object.assign({}, config, { extensions: ['.tsx'] }));
    }
  },
  '.swc.js': {
    module: '@swc/register',
    register: (hook, config) => {
      config = config || getSWCConfig('.swc.js', 'ecmascript');
      hook(Object.assign({}, config, { extensions: '.js' }));
    }
  },
  '.swc.jsx': {
    module: '@swc/register',
    register: (hook, config) => {
      config = config || getSWCConfig('.swc.jsx', 'ecmascript', true);
      hook(Object.assign({}, config, { extensions: '.jsx' }));
    }
  },
  '.swc.ts': {
    module: '@swc/register',
    register: (hook, config) => {
      config = config || getSWCConfig('.swc.ts', 'typescript');
      hook(Object.assign({}, config, { extensions: '.ts' }));
    }
  },
  '.swc.tsx': {
    module: '@swc/register',
    register: (hook, config) => {
      config = config || getSWCConfig('.swc.tsx', 'typescript', true);
      hook(Object.assign({}, config, { extensions: '.tsx' }));
    }
  },
  '.cjs': stubs.cjsStub,
  '.mjs': stubs.mjsStub,
  '.ts': [
    'ts-node/register',
    'sucrase/register/ts',
    {
      module: '@babel/register',
      register: function (hook, config) {
        config = config || getBabelConfig('.ts', ['@babel/preset-env', '@babel/preset-typescript']);
        hook(Object.assign({}, config, { extensions: '.ts' }));
      }
    },
    {
      module: 'esbuild-register/dist/node',
      register: function (mod, config) {
        config = config || getEsbuildConfig('node' + process.version.slice(1), filenameMatchers['.ts']);
        mod.register(Object.assign({}, config, { extensions: ['.ts'] }));
      }
    },
    {
      module: '@swc/register',
      register: function (hook, config) {
        config = config || getSWCConfig('.ts', 'typescript');
        hook(Object.assign({}, config, { extensions: '.ts' }));
      }
    }
  ],
  '.tsx': [
    'ts-node/register',
    'sucrase/register/tsx',
    {
      module: '@babel/register',
      register: function (hook, config) {
        config = config || getBabelConfig('.tsx', ['@babel/preset-env', '@babel.preset-react', ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]]);
        hook(Object.assign({}, config, { extensions: '.tsx' }));
      }
    },
    {
      module: 'esbuild-register/dist/node',
      register: function (mod, config) {
        config = config || getEsbuildConfig('node' + process.version.slice(1), filenameMatchers['.tsx']);
        mod.register(Object.assign({}, config, { extensions: ['.tsx'] }));
      }
    },
    {
      module: '@swc/register',
      register: function (hook, config) {
        config = config || getSWCConfig('.tsx', 'typescript', true);
        hook(Object.assign({}, config, { extensions: '.tsx' }));
      }
    }
  ],
  '.json5': 'json5/lib/register',
  '.coffee': 'coffeescript/register',
  '.coffee.md': 'coffeescript/register',
  '.litcoffee': 'coffeescript/register',
  '.mdx': '@mdx-js/register',
  '.yaml': 'yaml-hook/register',
  '.yml': 'yaml-hook/register',
  '.toml': {
    module: 'toml-require',
    register: (hook, config) => hook.install(config)
  }
};

const jsVariantExtensions = [
  '.js',
  '.babel.js',
  '.babel.jsx',
  '.babel.ts',
  '.babel.tsx',
  '.esbuild.js',
  '.esbuild.jsx',
  '.esbuild.ts',
  '.esbuild.tsx',
  '.cjs',
  '.coffee',
  '.coffee.md',
  '.jsx',
  '.litcoffee',
  '.mdx',
  '.mjs',
  '.sucrase.js',
  '.sucrase.jsx',
  '.sucrase.ts',
  '.sucrase.tsx',
  '.swc.js',
  '.swc.jsx',
  '.swc.ts',
  '.swc.tsx',
  '.ts',
  '.tsx'
];

module.exports = {
  extensions,
  jsVariants: jsVariantExtensions.reduce((result, ext) => {
    result[ext] = extensions[ext];
    return result;
  }, {})
};
