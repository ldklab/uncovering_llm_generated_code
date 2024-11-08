json
// package.json
{
  "name": "@babel/plugin-syntax-import-meta",
  "version": "1.0.0",
  "description": "Babel plugin to enable import.meta syntax parsing",
  "main": "lib/index.js",
  "keywords": [
    "babel-plugin",
    "syntax",
    "import.meta"
  ],
  "author": "Babel Team",
  "license": "MIT",
  "devDependencies": {
    "@babel/core": "^7.0.0"
  }
}

// lib/index.js
module.exports = function({ types: t }) {
  return {
    name: "syntax-import-meta",
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("importMeta");
    }
  };
};

// .babelrc
{
  "plugins": ["@babel/plugin-syntax-import-meta"]
}

// Installation instructions:

// npm
// To install this plugin, run the following command:
// npm install --save-dev @babel/plugin-syntax-import-meta

// yarn
// Alternatively, if you are using yarn, run:
// yarn add @babel/plugin-syntax-import-meta --dev
