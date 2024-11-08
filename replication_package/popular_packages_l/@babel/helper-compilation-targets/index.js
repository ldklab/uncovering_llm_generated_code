// package.json
{
  "name": "@babel/helper-compilation-targets",
  "version": "1.0.0",
  "main": "index.js",
  "description": "Helper functions on Babel compilation targets",
  "scripts": {
    "test": "node tests.js"
  },
  "author": "",
  "license": "MIT"
}

// index.js
const browserslist = require('browserslist');
const compatData = require('@mdn/browser-compat-data');
const { features } = compatData.javascript;

function getCompilationTargets(query) {
  return browserslist(query);
}

function isFeatureSupported(feature, query) {
  const targets = getCompilationTargets(query);
  
  if (!(feature in features)) {
    throw new Error(`Unknown feature: ${feature}`);
  }
  
  return targets.every(target => {
    const [browser, version] = target.split(' ');
    return features[feature].__compat.support[browser] &&
           features[feature].__compat.support[browser].version_added <= parseFloat(version);
  });
}

function listSupportedFeatures(query) {
  const targets = getCompilationTargets(query);
  const supportedFeatures = [];

  for (let feature in features) {
    if (isFeatureSupported(feature, query)) {
      supportedFeatures.push(feature);
    }
  }

  return supportedFeatures;
}

module.exports = {
  getCompilationTargets,
  isFeatureSupported,
  listSupportedFeatures
};

// tests.js
const {
  getCompilationTargets,
  isFeatureSupported,
  listSupportedFeatures
} = require('./index');

const testQuery = '> 0.25%, not dead';

console.log('Compilation Targets:', getCompilationTargets(testQuery));
console.log('Is arrow functions supported:', isFeatureSupported('arrow-functions', testQuery));
console.log('Supported features:', listSupportedFeatures(testQuery));
