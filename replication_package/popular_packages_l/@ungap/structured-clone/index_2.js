// index.js
import { serialize, deserialize } from './structuredClone';
import { stringify, parse } from './json';

// Main function that clones a value using structured cloning
function structuredClone(value, options = {}) {
  const serialized = serialize(value, options); // Serializes the input
  return deserialize(serialized); // Deserializes to produce a deep clone
}

// Export functionality only if running in a Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = structuredClone; // Export the main clone function
  module.exports.serialize = serialize; // Export the serializer
  module.exports.deserialize = deserialize; // Export the deserializer
  module.exports.json = { stringify, parse }; // Export the JSON functions
}

// structuredClone.js
// Function to serialize a value, optionally handling functions and symbols with lossy option
export function serialize(value, options = {}) {
  const { lossy = false, json = false } = options;
  return JSON.stringify(value, (key, value) => {
    if (typeof value === 'function' || typeof value === 'symbol') { // Check for unsafely serializable types
      if (lossy || json) return null; // Omit functions/symbols if lossy or JSON option is set
      throw new TypeError('Cannot serialize functions or symbols'); // Error if an unsafely serializable type is encountered
    }
    if (json && typeof value.toJSON === 'function') {
      return value.toJSON(); // Use custom toJSON method if available
    }
    return value; // Default serialization behavior
  });
}

// Function to deserialize a JSON string back into a JavaScript value
export function deserialize(serialized) {
  return JSON.parse(serialized); 
}

// json.js
// Function to JSON stringify a value with both lossy and JSON options
export function stringify(value) {
  return serialize(value, { lossy: true, json: true });
}

// Function to parse a JSON string back into a JavaScript value
export function parse(serialized) {
  return deserialize(serialized);
}
