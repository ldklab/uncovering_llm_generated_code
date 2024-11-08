// index.js
const propertyAliasMappings = new Map([
  ['scx', 'Script_Extensions'],
  ['sc', 'Script'],
  ['gc', 'General_Category'],
  ['ahex', 'ASCII_Hex_Digit'],
  ['alpha', 'Alphabetic'],
  ['bidi_c', 'Bidi_Control'],
  // Further mappings can be added based on ECMAScript definitions
]);

module.exports = propertyAliasMappings;

// package.json
{
  "name": "unicode-property-alias-mappings",
  "version": "1.0.0",
  "description": "Provides Unicode property alias mappings as per ECMAScript standards.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no tests specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mathiasbynens/unicode-property-alias-mappings.git"
  },
  "keywords": [
    "unicode",
    "ecmascript",
    "regex",
    "property",
    "mapping",
    "aliases"
  ],
  "author": "Mathias Bynens",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/mathiasbynens/unicode-property-alias-mappings/issues"
  },
  "homepage": "https://github.com/mathiasbynens/unicode-property-alias-mappings#readme"
}

// usage-example.js
const unicodePropertyAliases = require('./index.js');

console.log(unicodePropertyAliases.get('scx')); // Expected output: 'Script_Extensions'
