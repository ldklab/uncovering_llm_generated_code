// index.js

const fs = require('fs');

class Yaml {
  constructor() {}

  static parse(yamlString) {
    // Parse a given YAML string into a JavaScript object.
    try {
      // Split the input YAML string into lines
      const lines = yamlString.trim().split('\n');
      const result = {};
      let currentKey = null;

      // Iterate through each line to build the object
      for (const line of lines) {
        if (line.includes(':')) {
          // Split line into key and value, trim whitespaces
          const [key, value] = line.split(':').map(str => str.trim());
          currentKey = key;
          // Start with key-value or assign an empty array for subsequent lines
          result[key] = value || [];
        } else if (currentKey) {
          // Add additional lines under the current key as elements of an array
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
    // Convert a JavaScript object into a YAML string representation.
    try {
      let yamlString = '';
      for (const [key, value] of Object.entries(jsObject)) {
        if (Array.isArray(value)) {
          // For array values, output the key followed by each item prefixed by '-'
          yamlString += `${key}:\n`;
          value.forEach(item => {
            yamlString += `  - ${item}\n`;
          });
        } else {
          // For non-array values, output key: value
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
