markdown
// index.js

module.exports = () => ({
  name: "syntax-dynamic-import",
  manipulateOptions(options, parserOptions) {
    parserOptions.plugins.push("dynamicImport");
  },
});

// package.json

{
  "name": "@babel/plugin-syntax-dynamic-import",
  "version": "1.0.0",
  "description": "Enables parsing of dynamic import() syntax",
  "main": "index.js",
  "keywords": [
    "babel",
    "babel-plugin",
    "syntax",
    "dynamic-import"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {},
  "peerDependencies": {
    "@babel/core": "^7.0.0"
  }
}

// README.md

# @babel/plugin-syntax-dynamic-import

> Enables parsing of dynamic import() syntax

For more details, check our website [@babel/plugin-syntax-dynamic-import](https://babeljs.io/docs/en/next/babel-plugin-syntax-dynamic-import.html).

## Install

To install via npm:

