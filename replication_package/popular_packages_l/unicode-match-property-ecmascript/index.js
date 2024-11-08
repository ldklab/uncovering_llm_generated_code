markdown
// package.json
{
  "name": "unicode-match-property-ecmascript",
  "version": "0.1.0",
  "description": "Matches a given Unicode property or property alias to its canonical property name, using strict matching per ECMAScript RegExp Unicode property escapes.",
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
const unicodePropertyAliasesEcmascript = {
    Script: 'sc',
    // other canonical properties and their aliases
};

function matchProperty(value) {
    for (const [canonical, alias] of Object.entries(unicodePropertyAliasesEcmascript)) {
        if (value === canonical || value === alias) {
            return canonical;
        }
    }
    throw new Error('Invalid Unicode property or property alias: ' + value);
}

module.exports = matchProperty;

// test.js
const matchProperty = require('./index.js');

try {
    console.log(matchProperty('sc')); // 'Script'
    console.log(matchProperty('Script')); // 'Script'
    console.log(matchProperty('script')); // Error
} catch (error) {
    console.error(error.message);
}
