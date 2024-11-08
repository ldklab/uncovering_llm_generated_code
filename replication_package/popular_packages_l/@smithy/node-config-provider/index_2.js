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
      const rawData = fs.readFileSync(filePath, 'utf8');
      let parsedData;

      if (ext === '.json') {
        parsedData = JSON.parse(rawData);
      } else if (ext === '.yml' || ext === '.yaml') {
        parsedData = this.parseYAML(rawData);
      } else {
        throw new Error('Unsupported file extension');
      }

      this.config = { ...this.config, ...parsedData };
    } catch (error) {
      throw new Error(`Failed to load configuration file: ${error.message}`);
    }
  }

  loadFromEnv(prefix = '') {
    Object.entries(process.env).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        const configKey = key.substring(prefix.length);
        this.config[configKey] = value;
      }
    });
  }

  get(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  parseYAML(yamlContent) {
    return yamlContent.split('\n').reduce((acc, line) => {
      const [key, value] = line.split(':').map(item => item.trim());
      if (key && value) acclude[key] = value;
      return acc;
    }, {});
  }

  update(key, value) {
    this.config[key] = value;
  }

  onConfigChange(callback) {
    const configDir = 'path/to/config/dir';
    fs.watch(configDir, (eventType, filename) => {
      if (filename && (filename.endsWith('.json') || filename.endsWith('.yml') || filename.endsWith('.yaml'))) {
        this.loadFromFile(path.join(configDir, filename));
        callback(this.config);
      }
    });
  }
}

module.exports = ConfigProvider;
