// @ts-check
const { resolve } = require('node:path');
const config = require('lilconfig');
const loadOptions = require('./options.js');
const loadPlugins = require('./plugins.js');
const req = require('./req.js');

const interopRequireDefault = (obj) => 
  obj && obj.__esModule ? obj : { default: obj };

async function processResult(ctx, result) {
  let file = result.filepath || '';
  let projectConfig = interopRequireDefault(result.config).default || {};

  if (typeof projectConfig === 'function') {
    projectConfig = projectConfig(ctx);
  } else {
    projectConfig = Object.assign({}, projectConfig, ctx);
  }

  if (!projectConfig.plugins) {
    projectConfig.plugins = [];
  }

  let res = {
    file,
    options: await loadOptions(projectConfig, file),
    plugins: await loadPlugins(projectConfig, file)
  };
  delete projectConfig.plugins;
  return res;
}

function createContext(ctx) {
  ctx = Object.assign(
    {
      cwd: process.cwd(),
      env: process.env.NODE_ENV
    },
    ctx
  );

  if (!ctx.env) {
    process.env.NODE_ENV = 'development';
  }

  return ctx;
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
      throw new Error(
        `'yaml' is required for the YAML configuration files. Make sure it is installed\nError: ${e.message}`
      );
    }
  }
  return yaml.parse(content);
}

const withLoaders = (options = {}) => {
  let moduleName = 'postcss';

  return {
    ...options,
    loaders: {
      ...options.loaders,
      '.cjs': loader,
      '.cts': loader,
      '.js': loader,
      '.mjs': loader,
      '.mts': loader,
      '.ts': loader,
      '.yaml': yamlLoader,
      '.yml': yamlLoader
    },
    searchPlaces: [
      ...(options.searchPlaces || []),
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
    ]
  };
}

function rc(ctx, path, options) {
  ctx = createContext(ctx);
  path = path ? resolve(path) : process.cwd();

  return config
    .lilconfig('postcss', withLoaders(options))
    .search(path)
    .then((result) => {
      if (!result) {
        throw new Error(`No PostCSS Config found in: ${path}`);
      }
      return processResult(ctx, result);
    });
}

module.exports = rc;