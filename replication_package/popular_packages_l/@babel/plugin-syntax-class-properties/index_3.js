// index.js
module.exports = function ({ types: t }) {
  return {
    name: "syntax-class-properties",
    visitor: {
      ClassProperty(path) {
        // The plugin is intended to enable parsing of class properties by recognizing them
        console.log("Visiting a class property!");
      }
    }
  };
};

// package.json
{
  "name": "@babel/plugin-syntax-class-properties",
  "version": "1.0.0",
  "description": "A Babel plugin to allow parsing of class properties.",
  "main": "index.js",
  "keywords": [
    "babel-plugin",
    "syntax",
    "class properties"
  ],
  "author": "Babel Contributors",
  "license": "MIT",
  "dependencies": {
    "@babel/core": "^7.0.0"
  },
  "devDependencies": {
    "@babel/parser": "^7.0.0"
  }
}
