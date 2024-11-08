json
// File: index.js

module.exports = function(api) {
  api.assertVersion(7);

  // Jest-specific Babel plugins configuration
  const plugins = [
    '@babel/plugin-transform-modules-commonjs', // Transform ES modules to CommonJS
    '@babel/plugin-transform-runtime',          // Optimize helper code
    // Additional Jest-related Babel plugins can be added here
  ];

  return {
    plugins: plugins,
  };
};

// File: package.json

{
  "name": "babel-preset-jest",
  "version": "1.0.0",
  "description": "A Babel preset for Jest plugins",
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

// Installation command
// Execute `npm install --save-dev babel-preset-jest`

// Example usage in babel.config.js
/*
module.exports = {
  presets: ['babel-preset-jest'],
};
*/
