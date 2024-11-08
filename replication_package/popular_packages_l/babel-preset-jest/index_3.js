json
// File: index.js

module.exports = function(api) {
  api.assertVersion(7);

  const plugins = [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-runtime',
  ];

  return {
    plugins,
  };
};

// File: package.json

{
  "name": "babel-preset-jest",
  "version": "1.0.0",
  "description": "Babel preset for all Jest plugins",
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

// Installation instruction
// Run `npm install --save-dev babel-preset-jest` to install

// Usage (babel.config.js example):
/*
module.exports = {
  presets: ['babel-preset-jest'],
};
*/
