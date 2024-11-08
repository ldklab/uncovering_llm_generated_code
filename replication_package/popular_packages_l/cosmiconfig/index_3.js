const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const JSON5 = require('json5');

// Default loaders for different file types
const defaultLoaders = {
  '.json': (filepath, content) => JSON5.parse(content),
  '.yaml': (filepath, content) => yaml.load(content),
  '.yml': (filepath, content) => yaml.load(content),
  '.js': (filepath) => require(filepath),
  '.ts': (filepath) => require(filepath),
};

// Helper function to read files asynchronously
const readFile = (filepath) => fs.promises.readFile(filepath, 'utf8');

// Determine potential config file names based on moduleName
const searchPlaces = (moduleName) => [
  'package.json',
  `.${moduleName}rc`,
  `.${moduleName}rc.json`,
  `.${moduleName}rc.yaml`,
  `.${moduleName}rc.yml`,
  `${moduleName}.config.js`,
];

// Main class for asynchronous configuration loading
class Cosmiconfig {
  constructor(moduleName, options = {}) {
    this.moduleName = moduleName;
    this.searchPlaces = options.searchPlaces || searchPlaces(moduleName);
    this.loaders = { ...defaultLoaders, ...options.loaders };
    this.cache = new Map();  // Cache for storing loaded configurations
  }

  // Asynchronous search for configuration files
  async search(searchFrom = process.cwd()) {
    let currentDir = searchFrom;

    while (currentDir) {
      for (const place of this.searchPlaces) {
        const filepath = path.join(currentDir, place);
        if (fs.existsSync(filepath)) {
          const result = await this.load(filepath);
          if (result) return result;
        }
      }
      const parentDir = path.dirname(currentDir);
      if (currentDir === parentDir) break;
      currentDir = parentDir;
    }

    return null;
  }

  // Load a configuration file asynchronously
  async load(filepath) {
    const ext = path.extname(filepath) || 'noExt';
    const loader = this.loaders[ext];
    if (!loader) return null;

    const content = await readFile(filepath);
    const config = loader(filepath, content);

    return { config, filepath, isEmpty: !config || Object.keys(config).length === 0 };
  }

  // Clear caches if any usage in the future.
  clearCache() {
    this.cache.clear();
  }
}

// Synchronous version of the Cosmiconfig for loading configurations
class CosmiconfigSync extends Cosmiconfig {
  constructor(moduleName, options = {}) {
    super(moduleName, options);
    this.loaders = { ...defaultLoaders, ...this._syncLoaders() };
  }

  // Specialized synchronous file loaders
  _syncLoaders() {
    return {
      '.json': (filepath, content) => JSON5.parse(content),
      '.yaml': (filepath, content) => yaml.load(content),
      '.yml': (filepath, content) => yaml.load(content),
      '.js': (filepath) => require(filepath),
      '.ts': (filepath) => require(filepath),
    };
  }

  // Synchronous search for configuration files
  search(searchFrom = process.cwd()) {
    let currentDir = searchFrom;

    while (currentDir) {
      for (const place of this.searchPlaces) {
        const filepath = path.join(currentDir, place);
        if (fs.existsSync(filepath)) {
          const result = this.load(filepath);
          if (result) return result;
        }
      }
      const parentDir = path.dirname(currentDir);
      if (currentDir === parentDir) break;
      currentDir = parentDir;
    }

    return null;
  }

  // Load a configuration file synchronously
  load(filepath) {
    const ext = path.extname(filepath) || 'noExt';
    const loader = this.loaders[ext];
    if (!loader) return null;

    const content = fs.readFileSync(filepath, 'utf8');
    const config = loader(filepath, content);

    return { config, filepath, isEmpty: !config || Object.keys(config).length === 0 };
  }
}

// Factory functions for creating instances of the configuration loaders
const cosmiconfig = (moduleName, options) => new Cosmiconfig(moduleName, options);
const cosmiconfigSync = (moduleName, options) => new CosmiconfigSync(moduleName, options);

module.exports = { cosmiconfig, cosmiconfigSync };
