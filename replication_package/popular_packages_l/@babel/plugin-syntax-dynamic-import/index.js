markdown
// index.js

module.exports = function() {
  return {
    name: "syntax-dynamic-import",
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("dynamicImport");
    }
  };
};

// package.json

{
  "name": "@babel/plugin-syntax-dynamic-import",
  "version": "1.0.0",
  "description": "Allow parsing of import()",
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

> Allow parsing of import()

See our website [@babel/plugin-syntax-dynamic-import](https://babeljs.io/docs/en/next/babel-plugin-syntax-dynamic-import.html) for more information.

## Install

Using npm:

