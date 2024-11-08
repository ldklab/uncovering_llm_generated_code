json
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
const { javascript: { features } } = require('@mdn/browser-compat-data');

function getCompilationTargets(query) {
  return browserslist(query);
}

function isFeatureSupported(feature, query) {
  const targets = getCompilationTargets(query);
  
  if (!features[feature]) {
    throw new Error(`Unknown feature: ${feature}`);
  }
  
  return targets.every(target => {
    const [browser, version] = target.split(' ');
    const browserSupport = features[feature].__compat.support[browser];
    
    if (!browserSupport || !('version_added' in browserSupport)) {
      return false;
    }
    
    return parseFloat(version) >= parseFloat(browserSupport.version_added);
  });
}

function listSupportedFeatures(query) {
  return Object.keys(features)
    .filter(feature => isFeatureSupported(feature, query));
}

module.exports = {
  getCompilationTargets,
  isFeatureSupported,
  listSupportedFeatures
};

// tests.js
const { getCompilationTargets, isFeatureSupported, listSupportedFeatures } = require('./index');

const testQuery = '> 0.25%, not dead';

console.log('Compilation Targets:', getCompilationTargets(testQuery));
console.log('Is arrow functions supported:', isFeatureSupported('arrow-functions', testQuery));
console.log('Supported features:', listSupportedFeatures(testQuery));
