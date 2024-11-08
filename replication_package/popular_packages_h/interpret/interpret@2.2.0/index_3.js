const path = require('path');

const endsInBabelJs = /\.babel\.[jt]s(x)$/;

const mjsStub = path.join(__dirname, 'mjs-stub');

function ignoreNonBabelAndNodeModules(file) {
  return !endsInBabelJs.test(file) &&
         path.relative(process.cwd(), file).split(path.sep).indexOf('node_modules') >= 0;
}

const extensions = {
  '.babel.js': createBabelExtension('.js'),
  '.babel.ts': createBabelExtension('.ts'),
  '.buble.js': 'buble/register',
  '.cirru': 'cirru-script/lib/register',
  '.cjsx': 'node-cjsx/register',
  '.co': 'coco',
  '.coffee': getCoffeeScriptModules(),
  '.coffee.md': getCoffeeScriptModules(),
  '.csv': 'require-csv',
  '.eg': 'earlgrey/register',
  '.esm.js': createEsmExtension(),
  '.iced': getIcedCoffeeModules(),
  '.iced.md': 'iced-coffee-script/register',
  '.ini': 'require-ini',
  '.js': null,
  '.json': null,
  '.json5': ['json5/lib/register', 'json5/lib/require'],
  '.jsx': createJSXExtension(),
  '.litcoffee': getCoffeeScriptModules(),
  '.liticed': 'iced-coffee-script/register',
  '.ls': ['livescript', 'LiveScript'],
  '.mjs': mjsStub,
  '.node': null,
  '.toml': createTomlExtension(),
  '.ts': createTSExtension(),
  '.tsx': createTSXExtension(),
  '.wisp': 'wisp/engine/node',
  '.xml': 'require-xml',
  '.yaml': 'require-yaml',
  '.yml': 'require-yaml'
};

const jsVariantExtensions = [
  '.js', '.babel.js', '.babel.ts', '.buble.js', '.cirru', '.cjsx', '.co',
  '.coffee', '.coffee.md', '.eg', '.esm.js', '.iced', '.iced.md', '.jsx',
  '.litcoffee', '.liticed', '.ls', '.mjs', '.ts', '.tsx', '.wisp'
];

module.exports = {
  extensions,
  jsVariants: jsVariantExtensions.reduce((result, ext) => {
    result[ext] = extensions[ext];
    return result;
  }, {})
};

function createBabelExtension(extension) {
  return [
    {
      module: '@babel/register',
      register: (hook) => {
        hook({
          extensions: extension,
          rootMode: 'upward-optional',
          ignore: [ignoreNonBabelAndNodeModules],
        });
      },
    },
    {
      module: 'babel-register',
      register: (hook) => {
        hook({ extensions: extension, ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'babel-core/register',
      register: (hook) => {
        hook({ extensions: extension, ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'babel/register',
      register: (hook) => {
        hook({ extensions: extension, ignore: ignoreNonBabelAndNodeModules });
      },
    }
  ];
};

function createEsmExtension() {
  return {
    module: 'esm',
    register: (hook) => {
      const esmLoader = hook(module);
      require.extensions['.js'] = esmLoader('module')._extensions['.js'];
    },
  };
};

function createTomlExtension() {
  return {
    module: 'toml-require',
    register: (hook) => {
      hook.install();
    },
  };
};

function createTSExtension() {
  return [
    'ts-node/register',
    'typescript-node/register',
    'typescript-register',
    'typescript-require',
    'sucrase/register/ts',
    {
      module: '@babel/register',
      register: (hook) => {
        hook({
          extensions: '.ts',
          rootMode: 'upward-optional',
          ignore: [ignoreNonBabelAndNodeModules],
        });
      },
    }
  ];
};

function createTSXExtension() {
  return [
    'ts-node/register',
    'typescript-node/register',
    'sucrase/register',
    {
      module: '@babel/register',
      register: (hook) => {
        hook({
          extensions: '.tsx',
          rootMode: 'upward-optional',
          ignore: [ignoreNonBabelAndNodeModules],
        });
      },
    }
  ];
};

function createJSXExtension() {
  return [
    {
      module: '@babel/register',
      register: (hook) => {
        hook({
          extensions: '.jsx',
          rootMode: 'upward-optional',
          ignore: [ignoreNonBabelAndNodeModules],
        });
      },
    },
    {
      module: 'babel-register',
      register: (hook) => {
        hook({ extensions: '.jsx', ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'babel-core/register',
      register: (hook) => {
        hook({ extensions: '.jsx', ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'babel/register',
      register: (hook) => {
        hook({ extensions: '.jsx', ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'node-jsx',
      register: (hook) => {
        hook.install({ extension: '.jsx', harmony: true });
      },
    }
  ];
};

function getCoffeeScriptModules() {
  return ['coffeescript/register', 'coffee-script/register', 'coffeescript', 'coffee-script'];
}

function getIcedCoffeeModules() {
  return ['iced-coffee-script/register', 'iced-coffee-script'];
}
