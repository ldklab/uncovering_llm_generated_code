// package.json
{
  "name": "@babel/plugin-syntax-import-meta",
  "version": "1.0.0",
  "description": "Babel plugin to allow parsing of import.meta syntax",
  "main": "lib/index.js",
  "keywords": ["babel-plugin", "syntax", "import.meta"],
  "author": "Babel Team",
  "license": "MIT",
  "devDependencies": {
    "@babel/core": "^7.0.0"
  }
}

// lib/index.js
module.exports = function ({ types: t }) {
  return {
    name: "syntax-import-meta",
    manipulateOptions(opts, parserOpts) {
      // Adding importMeta to parser plugins to allow parsing
      parserOpts.plugins.push("importMeta");
    }
  };
};

// .babelrc
{
  "plugins": ["@babel/plugin-syntax-import-meta"]
}

// Installation instruction scripts
// Run these commands in your terminal in the project directory to install

// Option 1: Using npm
// npm install --save-dev @babel/plugin-syntax-import-meta

// Option 2: Using yarn
// yarn add @babel/plugin-syntax-import-meta --dev
