// config-resolver.js

const fs = require('fs');
const path = require('path');

class ConfigResolver {
  constructor(options = {}) {
    this.defaultConfigFile = options.defaultConfigFile || 'config.json';
    this.config = this.loadConfig();
  }

  loadConfig() {
    let config = {};

    // Load default configuration from file
    const configPath = path.resolve(__dirname, this.defaultConfigFile);
    if (fs.existsSync(configPath)) {
      try {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        config = { ...config, ...fileConfig };
      } catch (error) {
        console.error('Failed to parse default config file:', error);
      }
    }

    // Override with environment variables
    Object.keys(process.env).forEach((key) => {
      config[key] = process.env[key];
    });

    return config;
  }

  get(key) {
    return this.config[key];
  }
}

module.exports = ConfigResolver;

// example.js - Example usage

const ConfigResolver = require('./config-resolver');

// Initialize the ConfigResolver, optionally specify a default config file
const configResolver = new ConfigResolver();

// Retrieve a configuration value by key
const someConfigValue = configResolver.get('SOME_CONFIG_KEY');
console.log('Config Value:', someConfigValue);
