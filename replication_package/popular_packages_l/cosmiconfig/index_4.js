const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const JSON5 = require('json5');

const defaultLoaders = {
  '.json': (filepath, content) => JSON5.parse(content),
  '.yaml': (filepath, content) => yaml.load(content),
  '.yml': (filepath, content) => yaml.load(content),
  '.js': (filepath) => require(filepath),
  '.ts': (filepath) => require(filepath),
};

const readFile = (filepath) => fs.promises.readFile(filepath, 'utf8');

const searchPlaces = (moduleName) => [
  'package.json',
  `.${moduleName}rc`,
  `.${moduleName}rc.json`,
  `.${moduleName}rc.yaml`,
  `.${moduleName}rc.yml`,
  `${moduleName}.config.js`,
];

class Cosmiconfig {
  constructor(moduleName, options = {}) {
    this.moduleName = moduleName;
    this.searchPlaces = options.searchPlaces || searchPlaces(moduleName);
    this.loaders = { ...defaultLoaders, ...options.loaders };
    this.cache = new Map();
  }

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

  async load(filepath) {
    const ext = path.extname(filepath) || 'noExt';
    const loader = this.loaders[ext];
    if (!loader) return null;

    const content = await readFile(filepath);
    const config = loader(filepath, content);

    return { config, filepath, isEmpty: !config || Object.keys(config).length === 0 };
  }

  clearCache() {
    this.cache.clear();
  }
}

class CosmiconfigSync extends Cosmiconfig {
  constructor(moduleName, options = {}) {
    super(moduleName, options);
    this.loaders = { ...defaultLoaders, ...this._syncLoaders() };
  }

  _syncLoaders() {
    return {
      '.json': (filepath, content) => JSON5.parse(content),
      '.yaml': (filepath, content) => yaml.load(content),
      '.yml': (filepath, content) => yaml.load(content),
      '.js': (filepath) => require(filepath),
      '.ts': (filepath) => require(filepath),
    };
  }

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

  load(filepath) {
    const ext = path.extname(filepath) || 'noExt';
    const loader = this.loaders[ext];
    if (!loader) return null;

    const content = fs.readFileSync(filepath, 'utf8');
    const config = loader(filepath, content);

    return { config, filepath, isEmpty: !config || Object.keys(config).length === 0 };
  }
}

const cosmiconfig = (moduleName, options) => new Cosmiconfig(moduleName, options);
const cosmiconfigSync = (moduleName, options) => new CosmiconfigSync(moduleName, options);

module.exports = { cosmiconfig, cosmiconfigSync };
