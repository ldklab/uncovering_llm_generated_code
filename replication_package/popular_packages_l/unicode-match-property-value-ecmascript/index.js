markdown
// index.js
const propertyValueAliases = require('./unicode-property-value-aliases');

function matchPropertyValue(property, value) {
  if (!propertyValueAliases.hasOwnProperty(property)) {
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
  'Script_Extensions': {
    'Aghb': 'Caucasian_Albanian',
    'Caucasian_Albanian': 'Caucasian_Albanian',
    // Add more property value aliases as needed
  },
  // Additional properties and their potential values can be listed here
};

// Usage Example
const matchPropertyValue = require('./index');

try {
  console.log(matchPropertyValue('Script_Extensions', 'Aghb')); // → 'Caucasian_Albanian'
  console.log(matchPropertyValue('Script_Extensions', 'Caucasian_Albanian')); // → 'Caucasian_Albanian'
  console.log(matchPropertyValue('script_extensions', 'Caucasian_Albanian')); // → throws
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
