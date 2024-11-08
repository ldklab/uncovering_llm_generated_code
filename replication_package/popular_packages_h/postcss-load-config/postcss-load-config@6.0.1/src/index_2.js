// @ts-check
const { resolve } = require('node:path');
const config = require('lilconfig');
const loadOptions = require('./options.js');
const loadPlugins = require('./plugins.js');
const req = require('./req.js');

/**
 * Ensures compatibility by handling esm default exports
 * @param {Object} obj - The module object
 * @return {Object} - The module's exports
 */
const interopRequireDefault = (obj) => obj && obj.__esModule ? obj : { default: obj };

/**
 * Process and normalize the configuration result
 * @param {Object} ctx - Config Context
 * @param {Object} result - Cosmiconfig result
 * @return {Promise<Object>} - Processed PostCSS Config
 */
async function processResult(ctx, result) {
  let projectConfig = interopRequireDefault(result.config).default || {};
  if (typeof projectConfig === 'function') {
    projectConfig = projectConfig(ctx);
  } else {
    projectConfig = { ...projectConfig, ...ctx };
  }
  return {
    file: result.filepath || '',
    options: await loadOptions(projectConfig, result.filepath || ''),
    plugins: await loadPlugins(projectConfig, result.filepath || '')
  };
}

/**
 * Construct a config context with defaults
 * @param {Object} ctx - Initial Config Context
 * @return {Object} - Complete Config Context
 */
function createContext(ctx) {
  return {
    cwd: process.cwd(),
    env: process.env.NODE_ENV || 'development',
    ...ctx
  };
}

/**
 * Synchronously require JavaScript configuration files
 * @param {string} filepath - The path to the config file
 * @return {Promise<any>} - Required config
 */
async function loader(filepath) {
  return req(filepath);
}

let yaml;
/**
 * Asynchronously parse YAML configuration files
 * @param {string} _ - Unused parameter
 * @param {string} content - YAML file content
 * @return {Promise<any>} - Parsed YAML object
 */
async function yamlLoader(_, content) {
  if (!yaml) {
    try {
      yaml = await import('yaml');
    } catch (e) {
      throw new Error(`'yaml' is required for YAML configuration files. Ensure it is installed\nError: ${e.message}`);
    }
  }
  return yaml.parse(content);
}

/**
 * Provides loader options and search locations for config formats
 * @param {Object} [options={}] - Initial options
 * @return {import('lilconfig').Options} - Options with customized loaders
 */
const withLoaders = (options = {}) => {
  const moduleName = 'postcss';
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

/**
 * Load and process PostCSS configuration
 * @param {Object} ctx - Config Context
 * @param {String} path - Config Path
 * @param {Object} options - Additional options
 * @return {Promise} - Processed PostCSS configuration
 */
function rc(ctx, path, options) {
  const finalCtx = createContext(ctx);
  const resolvedPath = path ? resolve(path) : process.cwd();

  return config.lilconfig('postcss', withLoaders(options)).search(resolvedPath)
    .then(result => {
      if (!result) throw new Error(`No PostCSS Config found in: ${resolvedPath}`);
      return processResult(finalCtx, result);
    });
}

module.exports = rc;
