// index.js

const fs = require('fs');
const path = require('path');

class ConfigProvider {
  constructor() {
    this.config = {};
  }

  loadFromFile(filePath) {
    try {
      const fileExt = path.extname(filePath);
      let fileData = fs.readFileSync(filePath, 'utf8');
      if (fileExt === '.json') {
        fileData = JSON.parse(fileData);
      } else if (fileExt === '.yml' || fileExt === '.yaml') {
        fileData = this.parseYAML(fileData);
      }
      this.config = { ...this.config, ...fileData };
    } catch (err) {
      throw new Error(`Failed to load config file: ${err.message}`);
    }
  }

  loadFromEnv(prefix = '') {
    Object.entries(process.env).forEach(([envKey, envValue]) => {
      if (envKey.startsWith(prefix)) {
        const configKey = envKey.slice(prefix.length);
        this.config[configKey] = envValue;
      }
    });
  }

  get(key, defaultValue = null) {
    return key in this.config ? this.config[key] : defaultValue;
  }

  parseYAML(yamlString) {
    const lines = yamlString.split('\n');
    const yamlObj = {};
    lines.forEach(line => {
      const [key, value] = line.split(':').map(element => element.trim());
      if (key && value) yamlObj[key] = value;
    });
    return yamlObj;
  }

  update(key, value) {
    this.config[key] = value;
  }

  onConfigChange(callback) {
    const configDirPath = 'path/to/config/dir';
    fs.watch(configDirPath, (event, filename) => {
      if (filename) {
        this.loadFromFile(path.join(configDirPath, filename));
        callback(this.config);
      }
    });
  }
}

module.exports = ConfigProvider;
