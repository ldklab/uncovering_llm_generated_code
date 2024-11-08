json
// File: index.js

module.exports = function(api) {
  // Ensure Babel version 7 or above
  api.assertVersion(7);

  // Configure Babel plugins for Jest
  const plugins = [
    '@babel/plugin-transform-modules-commonjs',  // Convert ES6 modules to CommonJS
    '@babel/plugin-transform-runtime',           // Optimize code with reusability
    // You can add additional Jest-specific plugins as needed here
  ];

  // Return the Babel configuration object with the plugins array
  return {
    plugins: plugins,
  };
};

// File: package.json

{
  "name": "babel-preset-jest",
  "version": "1.0.0",
  "description": "Babel preset providing Jest-specific transformations",
  "main": "index.js",
  "keywords": [
    "babel",
    "jest",
    "preset"
  ],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@babel/core": "^7.0.0",
    "@babel/plugin-transform-modules-commonjs": "^7.0.0",
    "@babel/plugin-transform-runtime": "^7.0.0"
  }
}

// Installation instruction for developers
// Use `npm install --save-dev babel-preset-jest` to add to your project

// Configure Babel in your project (babel.config.js example):
/*
module.exports = {
  presets: ['babel-preset-jest'],
};
*/
