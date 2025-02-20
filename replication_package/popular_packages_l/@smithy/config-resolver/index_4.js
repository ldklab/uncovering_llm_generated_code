// config-resolver.js

const fs = require('fs');
const path = require('path');

class ConfigResolver {
  constructor(options = {}) {
    this.defaultConfigFile = options.defaultConfigFile || 'config.json';
    this.config = this.loadConfig();
  }

  // Loads configuration from default file and environment variables
  loadConfig() {
    let config = {};

    // Resolve and load default configuration file
    const configPath = path.resolve(__dirname, this.defaultConfigFile);
    if (fs.existsSync(configPath)) {
      try {
        const fileConfigContent = fs.readFileSync(configPath, 'utf-8');
        const fileConfig = JSON.parse(fileConfigContent);
        config = { ...config, ...fileConfig };
      } catch (error) {
        console.error('Error parsing default config file:', error);
      }
    }

    // Override config with environment variables
    for (let [key, value] of Object.entries(process.env)) {
      config[key] = value;
    }

    return config;
  }

  // Retrieve a config value by key
  get(key) {
    return this.config[key];
  }
}

module.exports = ConfigResolver;

// example.js - Example usage

const ConfigResolver = require('./config-resolver');

// Create an instance of ConfigResolver with an optional default config file
const configResolver = new ConfigResolver();

// Getting a config value using its key
const someConfigValue = configResolver.get('SOME_CONFIG_KEY');
console.log('Config Value:', someConfigValue);
