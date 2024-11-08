markdown
// package.json
{
  "name": "unicode-property-matcher",
  "version": "0.1.0",
  "description": "Matches Unicode property or alias to its canonical name following ECMAScript standards.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mathiasbynens/unicode-match-property-ecmascript.git"
  },
  "author": "Mathias Bynens",
  "license": "MIT"
}

// index.js
const unicodeProperties = {
  Script: 'sc',
  // Additional properties and aliases can be added here
};

function findCanonicalProperty(input) {
  for (const [canonical, alias] of Object.entries(unicodeProperties)) {
    if (input === canonical || input === alias) {
      return canonical;
    }
  }
  throw new Error(`Invalid Unicode property or alias: ${input}`);
}

module.exports = findCanonicalProperty;

// test.js
const findCanonicalProperty = require('./index.js');

try {
  console.log(findCanonicalProperty('sc')); // Output: 'Script'
  console.log(findCanonicalProperty('Script')); // Output: 'Script'
  console.log(findCanonicalProperty('script')); // Triggers Error
} catch (err) {
  console.error(err.message);
}
