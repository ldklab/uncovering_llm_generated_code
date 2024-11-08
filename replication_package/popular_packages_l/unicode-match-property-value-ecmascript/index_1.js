// Functionality Explanation:
// The Node.js code consists of a module that matches Unicode property values to their canonical values based on pre-defined aliases. It uses a mapping defined in a separate module to look up a property's alias and return its canonical form. If an unknown property or alias is provided, it throws an error.


// Rewritten Code:

// index.js
const propertyValueAliases = require('./unicode-property-value-aliases.js');

function matchPropertyValue(property, value) {
  if (!(property in propertyValueAliases)) {
    throw new Error(`Unknown property: ${property}`);
  }
  
  const canonicalValue = propertyValueAliases[property][value];
  if (!canonicalValue) {
    throw new Error(`Unknown value: ${value} for property: ${property}`);
  }
  
  return canonicalValue;
}

module.exports = matchPropertyValue;

// unicode-property-value-aliases.js
module.exports = {
  Script_Extensions: {
    Aghb: 'Caucasian_Albanian',
    Caucasian_Albanian: 'Caucasian_Albanian',
    // Additional aliases can be added here
  },
  // Further properties can be added as needed
};

// Usage Example
const matchPropertyValue = require('./index.js');

try {
  console.log(matchPropertyValue('Script_Extensions', 'Aghb')); // Output: 'Caucasian_Albanian'
  console.log(matchPropertyValue('Script_Extensions', 'Caucasian_Albanian')); // Output: 'Caucasian_Albanian'
  console.log(matchPropertyValue('script_extensions', 'Caucasian_Albanian')); // Throws error
} catch (error) {
  console.error(error.message);
}

// package.json
{
  "name": "unicode-match-property-value-ecmascript",
  "version": "1.0.0",
  "description": "Matches a given Unicode property value to its canonical value according to ECMAScript rules.",
  "main": "index.js",
  "scripts": {
    "test": "node index.js"
  },
  "author": "Mathias Bynens",
  "license": "MIT",
  "dependencies": {}
}
