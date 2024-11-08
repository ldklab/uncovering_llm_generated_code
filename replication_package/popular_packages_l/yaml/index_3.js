// index.js

const fs = require('fs');

class Yaml {
  constructor() {}

  static parse(yamlString) {
    // Parses a YAML string into a JavaScript object.
    try {
      const lines = yamlString.trim().split('\n'); // Split the YAML string into lines.
      const result = {}; // Initialize an empty object to store the parsed data.
      let currentKey = null; // Track the current key being processed.

      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':').map(str => str.trim()); // Split line into key and value at the colon.
          currentKey = key; // Set the current key.
          result[key] = value || []; // If there's a value, assign it; otherwise, assign an empty array.
        } else if (currentKey) {
          result[currentKey].push(line.trim()); // Append the indented value to the current key's array.
        }
      }

      return result; // Return the parsed object.
    } catch (error) {
      console.error('Failed to parse YAML string:', error);
      return null; // Return null if parsing fails.
    }
  }

  static stringify(jsObject) {
    // Converts a JavaScript object into a YAML string.
    try {
      let yamlString = ''; // Initialize an empty string for the YAML output.
      for (const [key, value] of Object.entries(jsObject)) {
        if (Array.isArray(value)) {
          yamlString += `${key}:\n`; // Append the key followed by a newline.
          value.forEach(item => {
            yamlString += `  - ${item}\n`; // Append each array item, prefixed with '- ' and indented.
          });
        } else {
          yamlString += `${key}: ${value}\n`; // Append keys with their respective scalar values.
        }
      }
      return yamlString; // Return the generated YAML string.
    } catch (error) {
      console.error('Failed to stringify object:', error);
      return ''; // Return an empty string if stringification fails.
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
