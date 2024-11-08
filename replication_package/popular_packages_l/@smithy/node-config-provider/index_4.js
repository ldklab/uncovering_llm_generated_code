// configProvider.js

const fs = require('fs');
const path = require('path');

class ConfigProvider {
  constructor() {
    this.config = {};
  }

  loadFromFile(filePath) {
    try {
      const ext = path.extname(filePath);
      let data = fs.readFileSync(filePath, 'utf8');
      if (ext === '.json') {
        data = JSON.parse(data);
      } else if (ext === '.yml' || ext === '.yaml') {
        data = this.parseYAML(data);
      }
      Object.assign(this.config, data);
    } catch (error) {
      throw new Error(`Failed to load configuration file: ${error.message}`);
    }
  }

  loadFromEnv(prefix = '') {
    for (let key of Object.keys(process.env)) {
      if (key.startsWith(prefix)) {
        const configKey = key.slice(prefix.length);
        this.config[configKey] = process.env[key];
      }
    }
  }

  get(key, defaultValue = null) {
    return this.config.hasOwnProperty(key) ? this.config[key] : defaultValue;
  }

  parseYAML(yamlString) {
    return yamlString.split('\n').reduce((yamlObj, line) => {
      const [key, value] = line.split(':').map(item => item.trim());
      if (key && value) yamlObj[key] = value;
      return yamlObj;
    }, {});
  }

  update(key, value) {
    this.config[key] = value;
  }

  onConfigChange(callback) {
    const configDir = 'path/to/config/dir';
    fs.watch(configDir, (eventType, filename) => {
      if (filename) {
        this.loadFromFile(path.join(configDir, filename));
        callback(this.config);
      }
    });
  }
}

module.exports = ConfigProvider;
