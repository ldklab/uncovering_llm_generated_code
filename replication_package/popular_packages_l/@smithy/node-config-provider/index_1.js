const fs = require('fs');
const path = require('path');

class ConfigProvider {
  constructor() {
    this.config = {};
  }

  loadFromFile(filePath) {
    try {
      const fileExtension = path.extname(filePath);
      let fileData = fs.readFileSync(filePath, 'utf8');
      if (fileExtension === '.json') {
        fileData = JSON.parse(fileData);
      } else if (fileExtension === '.yml' || fileExtension === '.yaml') {
        fileData = this.parseYAML(fileData);
      }
      this.config = { ...this.config, ...fileData };
    } catch (error) {
      throw new Error(`Failed to load configuration file: ${error.message}`);
    }
  }

  loadFromEnv(prefix = '') {
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(prefix)) {
        const configKey = key.slice(prefix.length);
        this.config[configKey] = value;
      }
    }
  }

  get(key, defaultValue = null) {
    return key in this.config ? this.config[key] : defaultValue;
  }

  parseYAML(yamlString) {
    const yamlLines = yamlString.split('\n');
    const yamlObject = {};
    yamlLines.forEach(line => {
      const [key, value] = line.split(':').map(item => item.trim());
      if (key && value) yamlObject[key] = value;
    });
    return yamlObject;
  }

  update(key, value) {
    this.config[key] = value;
  }

  onConfigChange(callback) {
    fs.watch('path/to/config/dir', (eventType, filename) => {
      if (filename) {
        this.loadFromFile(path.join('path/to/config/dir', filename));
        callback(this.config);
      }
    });
  }
}

module.exports = ConfigProvider;
