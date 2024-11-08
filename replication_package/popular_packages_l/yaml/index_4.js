// index.js

const fs = require('fs');

class Yaml {
  constructor() {}

  static parse(yamlString) {
    // This method parses a YAML string into a JavaScript object.
    try {
      const lines = yamlString.trim().split('\n'); // Split the YAML string into lines
      const result = {}; // Object to hold the parsed data
      let currentKey = null;

      for (const line of lines) {
        // For each line in the input string
        if (line.includes(':')) {
          // If the line contains a colon, it's a key-value pair
          const [key, value] = line.split(':').map(str => str.trim());
          currentKey = key; // Mark current key
          result[key] = value || []; // If there's no value, initialize with an empty array
        } else if (currentKey) {
          // If the line does not contain a colon and there's a current key (continuation of previous list)
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
    // This method converts a JavaScript object into a YAML string.
    try {
      let yamlString = '';
      for (const [key, value] of Object.entries(jsObject)) {
        // Iterate over each key-value pair in the object
        if (Array.isArray(value)) {
          // If the value is an array, format it as a list in YAML
          yamlString += `${key}:\n`;
          value.forEach(item => {
            yamlString += `  - ${item}\n`; // Indented list item
          });
        } else {
          yamlString += `${key}: ${value}\n`; // Otherwise, just add key and value
        }
      }
      return yamlString; // Return the resulting YAML string
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
