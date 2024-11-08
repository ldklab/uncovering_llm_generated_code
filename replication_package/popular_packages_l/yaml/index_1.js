// index.js

const fs = require('fs');

class Yaml {
  constructor() {}

  static parse(yamlString) {
    // Parses a simple YAML formatted string into a JavaScript object.
    try {
      const lines = yamlString.trim().split('\n');
      const result = {};
      let currentKey = null;

      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':').map(str => str.trim());
          currentKey = key;
          result[key] = value || [];
        } else if (currentKey) {
          result[currentKey].push(line.trim());
        }
      }

      return result;
    } catch (error) {
      console.error('Failed to parse YAML string:', error);
      return null;
    }
  }

  static stringify(jsObject) {
    // Converts a JavaScript object into a YAML formatted string.
    try {
      let yamlString = '';
      for (const [key, value] of Object.entries(jsObject)) {
        if (Array.isArray(value)) {
          yamlString += `${key}:\n`;
          value.forEach(item => {
            yamlString += `  - ${item}\n`;
          });
        } else {
          yamlString += `${key}: ${value}\n`;
        }
      }
      return yamlString;
    } catch (error) {
      console.error('Failed to stringify object:', error);
      return '';
    }
  }
}

// Usage examples:
const yamlString = `
YAML:
  - A human-readable data serialization language
  - https://en.wikipedia.org/wiki/YAML
`;

const parsedData = Yaml.parse(yamlString);
console.log('Parsed Data:', parsedData);

const jsObject = {
  number: 3,
  plain: 'string',
  block: ['two', 'lines']
};

const stringifiedYaml = Yaml.stringify(jsObject);
console.log('Stringified YAML:', stringifiedYaml);

// Exporting for module usage
module.exports = Yaml;
