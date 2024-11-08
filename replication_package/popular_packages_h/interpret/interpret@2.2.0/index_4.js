const path = require('path');

const endsInBabelJs = /\.babel\.[jt]s(x)?$/;

const mjsStub = path.join(__dirname, 'mjs-stub');

const ignoreNonBabelAndNodeModules = (file) => {
  const isNonBabel = !endsInBabelJs.test(file);
  const isInNodeModules = path.relative(process.cwd(), file).split(path.sep).includes('node_modules');
  return isNonBabel && isInNodeModules;
};

const createBabelRegisterConfig = (ext, additionalOpts = {}) => ({
  module: '@babel/register',
  register: (hook) => {
    hook({
      extensions: ext,
      rootMode: 'upward-optional',
      ignore: [ignoreNonBabelAndNodeModules],
      ...additionalOpts,
    });
  },
});

const extensions = {
  '.babel.js': [
    createBabelRegisterConfig('.js'),
    {
      module: 'babel-register',
      register(hook) {
        hook({ extensions: '.js', ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'babel-core/register',
      register(hook) {
        hook({ extensions: '.js', ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'babel/register',
      register(hook) {
        hook({ extensions: '.js', ignore: ignoreNonBabelAndNodeModules });
      },
    },
  ],
  '.babel.ts': [createBabelRegisterConfig('.ts')],
  '.buble.js': 'buble/register',
  '.cirru': 'cirru-script/lib/register',
  '.cjsx': 'node-cjsx/register',
  '.co': 'coco',
  '.coffee': ['coffeescript/register', 'coffee-script/register', 'coffeescript', 'coffee-script'],
  '.coffee.md': ['coffeescript/register', 'coffee-script/register', 'coffeescript', 'coffee-script'],
  '.csv': 'require-csv',
  '.eg': 'earlgrey/register',
  '.esm.js': {
    module: 'esm',
    register(hook) {
      const esmLoader = hook(module);
      require.extensions['.js'] = esmLoader('module')._extensions['.js'];
    },
  },
  '.iced': ['iced-coffee-script/register', 'iced-coffee-script'],
  '.iced.md': 'iced-coffee-script/register',
  '.ini': 'require-ini',
  '.js': null,
  '.json': null,
  '.json5': ['json5/lib/register', 'json5/lib/require'],
  '.jsx': [
    createBabelRegisterConfig('.jsx'),
    {
      module: 'babel-register',
      register(hook) {
        hook({ extensions: '.jsx', ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'babel-core/register',
      register(hook) {
        hook({ extensions: '.jsx', ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'babel/register',
      register(hook) {
        hook({ extensions: '.jsx', ignore: ignoreNonBabelAndNodeModules });
      },
    },
    {
      module: 'node-jsx',
      register(hook) {
        hook.install({ extension: '.jsx', harmony: true });
      },
    },
  ],
  '.litcoffee': ['coffeescript/register', 'coffee-script/register', 'coffeescript', 'coffee-script'],
  '.liticed': 'iced-coffee-script/register',
  '.ls': ['livescript', 'LiveScript'],
  '.mjs': mjsStub,
  '.node': null,
  '.toml': {
    module: 'toml-require',
    register(hook) {
      hook.install();
    },
  },
  '.ts': [
    'ts-node/register',
    'typescript-node/register',
    'typescript-register',
    'typescript-require',
    'sucrase/register/ts',
    createBabelRegisterConfig('.ts'),
  ],
  '.tsx': [
    'ts-node/register',
    'typescript-node/register',
    'sucrase/register',
    createBabelRegisterConfig('.tsx'),
  ],
  '.wisp': 'wisp/engine/node',
  '.xml': 'require-xml',
  '.yaml': 'require-yaml',
  '.yml': 'require-yaml',
};

const jsVariantExtensions = [
  '.js',
  '.babel.js',
  '.babel.ts',
  '.buble.js',
  '.cirru',
  '.cjsx',
  '.co',
  '.coffee',
  '.coffee.md',
  '.eg',
  '.esm.js',
  '.iced',
  '.iced.md',
  '.jsx',
  '.litcoffee',
  '.liticed',
  '.ls',
  '.mjs',
  '.ts',
  '.tsx',
  '.wisp',
];

module.exports = {
  extensions,
  jsVariants: Object.fromEntries(jsVariantExtensions.map(ext => [ext, extensions[ext]])),
};
