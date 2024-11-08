const path = require('node:path');
const config = require('lilconfig');

const loadOptions = require('./options.js');
const loadPlugins = require('./plugins.js');
const req = require('./req.js');

const interopRequireDefault = obj => 
  (obj && obj.__esModule) ? obj : { default: obj };

async function processResult(ctx, result) {
  const file = result.filepath || '';
  let projectConfig = interopRequireDefault(result.config).default || {};

  if (typeof projectConfig === 'function') {
    projectConfig = projectConfig(ctx);
  } else {
    projectConfig = { ...projectConfig, ...ctx };
  }

  projectConfig.plugins = projectConfig.plugins || [];

  const options = await loadOptions(projectConfig, file);
  const plugins = await loadPlugins(projectConfig, file);
  delete projectConfig.plugins;

  return { file, options, plugins };
}

function createContext(ctx) {
  const defaultContext = {
    cwd: process.cwd(),
    env: process.env.NODE_ENV || 'development'
  };

  return { ...defaultContext, ...ctx };
}

async function loader(filepath) {
  return req(filepath);
}

let yaml;
async function yamlLoader(_, content) {
  if (!yaml) {
    try {
      yaml = await import('yaml');
    } catch (e) {
      throw new Error(`'yaml' is required for YAML configuration files. Make sure it is installed\nError: ${e.message}`);
    }
  }
  return yaml.parse(content);
}

const withLoaders = (options = {}) => {
  const moduleName = 'postcss';
  const loaders = {
    ...options.loaders,
    '.cjs': loader,
    '.cts': loader,
    '.js': loader,
    '.mjs': loader,
    '.mts': loader,
    '.ts': loader,
    '.yaml': yamlLoader,
    '.yml': yamlLoader
  };

  const searchPlaces = [
    ...options.searchPlaces || [],
    'package.json',
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.ts`,
    `.${moduleName}rc.cts`,
    `.${moduleName}rc.mts`,
    `.${moduleName}rc.js`,
    `.${moduleName}rc.cjs`,
    `.${moduleName}rc.mjs`,
    `${moduleName}.config.ts`,
    `${moduleName}.config.cts`,
    `${moduleName}.config.mts`,
    `${moduleName}.config.js`,
    `${moduleName}.config.cjs`,
    `${moduleName}.config.mjs`
  ];

  return { ...options, loaders, searchPlaces };
}

function rc(ctx = {}, path = '', options = {}) {
  ctx = createContext(ctx);
  path = path ? path.resolve(path) : process.cwd();

  return config
    .lilconfig('postcss', withLoaders(options))
    .search(path)
    .then(result => {
      if (!result) {
        throw new Error(`No PostCSS Config found in: ${path}`);
      }
      return processResult(ctx, result);
    });
}

module.exports = rc;
