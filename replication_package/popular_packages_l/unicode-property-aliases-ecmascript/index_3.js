json
// unicode-property-aliases-ecmascript/index.js
const propertyAliases = new Map([
  ['scx', 'Script_Extensions'],
  ['sc', 'Script'],
  ['gc', 'General_Category'],
  ['ahex', 'ASCII_Hex_Digit'],
  ['alpha', 'Alphabetic'],
  ['bidi_c', 'Bidi_Control'],
  // Add other mappings as needed based on ECMAScript supported aliases
]);

module.exports = propertyAliases;

// package.json
{
  "name": "unicode-property-aliases-ecmascript",
  "version": "1.0.0",
  "description": "Unicode property alias mappings for ECMAScript.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no tests specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mathiasbynens/unicode-property-aliases-ecmascript.git"
  },
  "keywords": [
    "unicode",
    "ecmascript",
    "regex",
    "property",
    "aliases"
  ],
  "author": "Mathias Bynens",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/mathiasbynens/unicode-property-aliases-ecmascript/issues"
  },
  "homepage": "https://github.com/mathiasbynens/unicode-property-aliases-ecmascript#readme"
}

// Usage example
const propertyAliases = require('./unicode-property-aliases-ecmascript');

console.log(propertyAliases.get('scx')); // → 'Script_Extensions'
