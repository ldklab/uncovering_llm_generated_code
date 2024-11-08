// index.js

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
      this.config = { ...this.config, ...data };
    } catch (error) {
      throw new Error(`Failed to load configuration file: ${error.message}`);
    }
  }

  loadFromEnv(prefix = '') {
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith(prefix)) {
        const configKey = key.slice(prefix.length);
        this.config[configKey] = process.env[key];
      }
    });
  }

  get(key, defaultValue = null) {
    return this.config.hasOwnProperty(key) ? this.config[key] : defaultValue;
  }

  parseYAML(yamlString) {
    // Simple YAML parser implementation for demonstration
    const yamlLines = yamlString.split('\n');
    const yamlObj = {};
    yamlLines.forEach(line => {
      const [key, value] = line.split(':').map(item => item.trim());
      if (key && value) yamlObj[key] = value;
    });
    return yamlObj;
  }

  update(key, value) {
    this.config[key] = value;
  }

  onConfigChange(callback) {
    // Example: Add logic to watch for config changes and trigger callback
    fs.watch('path/to/config/dir', (eventType, filename) => {
      if (filename) {
        this.loadFromFile(path.join('path/to/config/dir', filename));
        callback(this.config);
      }
    });
  }
}

module.exports = ConfigProvider;
